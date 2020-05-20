/** general nodejs imports */
const fs = require('fs');

/** gulp init import */
const {
  src,
  dest,
  watch,
  series
} = require('gulp');

/** gulp plugin */
const ts = require('gulp-typescript'),
  plumber = require('gulp-plumber'),
  sass = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  autoprefixer = require('gulp-autoprefixer'),
  webpackStream = require('webpack-stream'),
  args = require('yargs'),
  rimraf = require('rimraf');

/** Browser Sync Configuration */
const browserSync = require('browser-sync');
const server = browserSync.create();

/** check for productive switch */
args.argv['ship'] !== undefined ? isProduction = true : isProduction = false;

/** check for browser load switch */
args.argv['nobrowser'] !== undefined ? newBrowser = false : newBrowser = true;

/** base path definitions */
const tsSrc = './src/**/*.ts*',
  sassFiles = './src/**/*.scss',
  outDir = './lib/';

/** typescript project definition used for building */
const tsProject = ts.createProject('tsconfig.json');

/** TASK: TypeScript compile */
const tsCompile = () => {

  return src(tsSrc)
    .pipe(plumber())
    .pipe(tsProject())
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
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write())
    .pipe(dest(outDir));

};

/** TASK: webpack bundeling of styles and TypeScript */
const webpack = () => {

  const webpackConfig = require('./webpack.config.js');

  if (isProduction) {
    webpackConfig.mode = 'production';
  } else {
    webpackConfig.mode = 'development';
    webpackConfig.externals = [];
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
    server: {
      baseDir: './app/',
      directory: false,
      routes: {
        '/lib': './lib/',
        '/node_modules': 'node_modules',
        '/dist': './dist'
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
rimraf.sync('./dist');

const build = series(tsCompile, sassCompile, webpack);

exports.build = build;
exports.serve = series(build, serve);