/** general nodejs imports */
const fs = require('fs');

/** gulp init import */
const {
  src,
  dest,
  watch,
  series,
  parallel,
  lastRun
} = require('gulp');

/** gulp plugin */
const ts = require('gulp-typescript'),
  plumber = require('gulp-plumber'),
  sass = require('gulp-sass')(require('sass')),
  sourcemaps = require('gulp-sourcemaps'),
  autoprefixer = require('gulp-autoprefixer'),
  webpackStream = require('webpack-stream'),
  args = require('yargs'),
  rimraf = require('rimraf'),
  wp = require('webpack'),
  path = require('path'),
  bundleAnalyzer = require('webpack-bundle-analyzer');

/** Browser Sync Configuration */
const browserSync = require('browser-sync');
const server = browserSync.create();

/** check for productive switch */
args.argv['ship'] !== undefined ? isProduction = true : isProduction = false;

/** check for browser load switch */
args.argv['nobrowser'] !== undefined ? newBrowser = false : newBrowser = true;

/** check for analyze switch */
args.argv['analyze'] !== undefined ? analyze = true : analyze = false;

/** base path definitions */
const tsSrc = './src/**/*.ts*',
  sassFiles = './src/**/*.scss',
  outDir = './lib/';

/** typescript project definition used for building */
const tsProject = ts.createProject('tsconfig.json');


/** injects the version  */
const version = (cb) => {

  if (fs.existsSync('./package.json')) {

    const pkgInfo = require('./package.json', 'UTF-8');

    const versionInfo = {
      name: pkgInfo.name,
      version: pkgInfo.version
    }

    fs.writeFileSync('./src/version.json',
      JSON.stringify(versionInfo, null, 2)
    );

  }

  cb();

}

/** TASK: TypeScript compile */
const tsCompile = () => {

  return src(tsSrc, {
      since: lastRun(tsCompile)
    })
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(sourcemaps.write('.', {
      includeContent: false,
      sourceRoot: './'
    }))
    .pipe(
      dest(outDir)
    );
};

/** TASK: compile SASS / SCSS */
const sassCompile = () => {

  return src(sassFiles)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass.sync({
      outputStyle: 'compressed',
      precision: 10,
      includePaths: ['.']
    }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write())
    .pipe(dest(outDir))
    .pipe(server.reload({
      stream: true
    }));

};

/** TASK: webpack bundling of styles and TypeScript */
const webpack = () => {
  const webpackConfig = require('./webpack.config.js');

  let bannerText = "";
  const fs = require('fs');
  const package = './package.json';
  if (fs.existsSync(package)) {
    const packageFileContent = fs.readFileSync(package, 'UTF-8');
    const pagesContents = JSON.parse(packageFileContent);
    bannerText = `*****${pagesContents.name} - Version: ${pagesContents.version} - ${pagesContents.description}*****`;
  }
  webpackConfig.plugins = [new wp.BannerPlugin({
    banner: bannerText
  })];

  if (!isProduction) {
    webpackConfig.mode = 'development';
    webpackConfig.devtool = 'source-map';
    webpackConfig.module.rules.push({
      test: /\.js$/,
      exclude: /node_modules/,
      enforce: "pre",
      use: ['source-map-loader']
    })
  }

  if (analyze) {
    const dropPath = path.join(__dirname, 'temp', 'stats');
    const lastDirName = path.basename(__dirname);
    const analyzerPlugIn = new bundleAnalyzer.BundleAnalyzerPlugin({
      openAnalyzer: false,
      analyzerMode: 'static',
      reportFilename: path.join(dropPath, `${lastDirName}.stats.html`),
      generateStatsFile: true,
      statsFilename: path.join(dropPath, `${lastDirName}.stats.json`),
      logLevel: 'error'
    })
    webpackConfig.plugins.push(analyzerPlugIn);
  }
  return src('lib/**/*.js')
    .pipe(plumber())
    .pipe(
      webpackStream(webpackConfig))
    .pipe(dest('dist'));
}

/** TASK: init development server */
const serve = (cb) => {

  server.init({
    notify: false,
    port: 3000,
    server: {
      baseDir: './',
      directory: true,
      routes: {
        '/lib': './lib/',
        '/node_modules': 'node_modules',
        '/dist': './dist',
        '/src': './src/'
      },
      https: true
    },
    open: newBrowser // remove if browser should open
  });

  watchSource();

  cb();
}

/** WATCH: watch for ts{x} and sass */
const watchSource = (cb) => {

  // watching styles
  watch('./src/**/*.s[a|c]ss',
    series(sassCompile, webpack)
  ).on('change', () => {
    server.reload();
  });

  // watching typescript
  watch('./src/**/*.{ts,tsx}',
    series(tsCompile, webpack)
  ).on('change', () => {
    server.reload();
  });

}

/** TASK: remove dist folder and start from scratch */
const clean = (cb) => {
  rimraf.sync('./dist')
  rimraf.sync('./lib');
  cb();
}

const build = series(clean, version, parallel(tsCompile, sassCompile), webpack);

exports.build = build;
exports.serve = series(build, serve);
exports.clean = clean;