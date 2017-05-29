"use strict";

var gulp = require('gulp');
var watch = require('gulp-watch');
var cache = require('gulp-cache');
var spsave = require('gulp-spsave');

var settings = require("./settings.json");
var security = require("./settings_security.json");

gulp.task('default', function () {});

gulp.task('clear', function (done) {
  return cache.clearAll(done);
});

gulp.task("copyToSharePoint", function () {
    return gulp.src(settings.srcFiles, { base: settings.rootFolder })
    .pipe(cache(
        spsave({
            username: security.username,
            password: security.pwd,
            siteUrl: settings.siteCollURL,
            folder: settings.destFolder
        }), {
            key: makeHashKey,
            fileCache: new cache.Cache({ cacheDirName: settings.projectname + '-cache' }),
            name: settings.username + "." + settings.projectname
        })
    )});

gulp.task("watch", function(){
    gulp.watch(settings.srcFiles, ["copyToSharePoint"]);
});

function makeHashKey(file) {
  return [file.contents.toString('utf8'), file.stat.mtime.toISOString()].join('');
}

