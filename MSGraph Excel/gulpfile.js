"use strict";

// For more information on automating your development process in classic SharePoint see the blog posts: 
// http://julieturner.net/series/conquer-your-dev-toolchain-in-classic-sharepoint/

var gulp = require('gulp');
var watch = require('gulp-watch');
var cache = require('gulp-cache');
var spsave = require('spsave').spsave;
var map = require('map-stream');

var settings = require("./settings.json");
var settingsSecurity = require("./settings_security.json");

gulp.task('default', function () {});

gulp.task('clear', function (done) {
  return cache.clearAll(done);
});

gulp.task("copyToSharePoint",
    function () {
        gulp.src(settings.srcFiles, { base: settingsSecurity.rootFolder })
            .pipe(
                cache(
                    map(function(file, cb) {
                        var filePath = file.history[0].replace(file.cwd, '.');
                        spsave({
                                siteUrl: settings.siteCollURL,
                                checkinType: 2,
                                checkin: false
                            },
                            {
                                username: settingsSecurity.username,
                                password: settingsSecurity.pwd
                            },
                            {
                                glob: filePath,
                                folder: settings.destFolder
                            }
                        );
                        cb(null, file);
                    }),
                    {
                        key: makeHashKey,
                        fileCache: new cache.Cache({ cacheDirName: settings.projectname + '-cache' }),
                        name: settingsSecurity.username + "." + settings.projectname
                    }
                )
            );
    }
);

gulp.task("watch", function(){
    gulp.watch(settings.srcFiles, ["copyToSharePoint"]);
});

function makeHashKey(file) {
  return [file.contents.toString('utf8'), file.stat.mtime.toISOString()].join('');
}

