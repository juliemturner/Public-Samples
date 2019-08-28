"use strict";
//Node v 8.16.0
var gulp = require('gulp');
var watch = require('gulp-watch');
var cache = require('gulp-cache');
var spsave = require('spsave').spsave;
var map = require('map-stream');
var vfs = require('vinyl-fs');
//var credman = require('windows-credman');

var settings = require("./settings.json");
var settingsSecurity = require("./settings_security.json");
//var username = credman.getCredentials(settingsSecurity.credentials).username;
//var password = credman.getCredentials(settingsSecurity.credentials).password;
var username = settingsSecurity.username;
var password = settingsSecurity.pwd;

gulp.task('clear', function (done) {
  return cache.clearAll(done);
});

function makeHashKey(file) {
  return [file.contents.toString('utf8'), file.stat.mtime.toISOString()].join('');
}

function copyToSharePointFolder(vinyl) {
  gulp.src(vinyl.path)
    .pipe(
      cache(
        map(function (file, cb) {
          spsave({
            siteUrl: settings.siteCollURL,
            checkinType: 2,
            checkin: false
          }, {
              username: username,
              password: password
            }, {
              file: file,
              folder: settings.destFolder
            });
          cb(null, file);
        }), {
          key: makeHashKey,
          fileCache: new cache.Cache({
            cacheDirName: settings.projectname + '-cache'
          }),
          name: username + "." + settings.projectname
        }
      )
    );
}

function copyToSharePointFlat(vinyl) {
  gulp.src(vinyl.path)
    .pipe(
      cache(
        map(
          function (file, cb) {
            var filePath = file.path.replace(file.cwd, '.');
            spsave({
              siteUrl: settings.siteCollURL,
              checkinType: 2,
              checkin: false
            }, {
                username: username,
                password: password
              }, {
                glob: filePath,
                folder: settings.destFolder
              });
            cb(null, file);
          }
        ), {
          //key: makeHashKey,
          fileCache: new cache.Cache({
            cacheDirName: settings.projectname + '-cache'
          }),
          name: username + "." + settings.projectname
        }
      )
    );
}

function copyToLegacySharePoint(vinyl) {
  gulp.src(vinyl.path)
    .pipe(
      cache(
        map(function (file, cb) {
          var filePath = file.path.replace(file.cwd, '.');
          console.log('Copying -- ' + file.path);
          vfs.src([filePath]).pipe(vfs.dest(settings.destFolder));
          cb(null, file);
        }), {
          key: makeHashKey,
          fileCache: new cache.Cache({
            cacheDirName: settings.projectname + '-cache'
          }),
          name: username + "." + settings.projectname
        }
      )
    );
}

gulp.task("watchFlat", function () {
  return watch(settings.srcFiles, {
    ignoreInitial: true,
    events: ['add', 'change']
  }, copyToSharePointFlat);
});

gulp.task("watchFolder", function () {
  return watch(settings.srcFiles, {
    ignoreInitial: true,
    events: ['add', 'change']
  }, copyToSharePointFolder);
});

gulp.task("watchLegacy", function () {
  return watch(settings.srcFiles, {
    ignoreInitial: true,
    events: ['add', 'change']
  }, copyToLegacySharePoint);
});