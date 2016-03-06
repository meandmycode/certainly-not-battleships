var path = require('path');
var http = require('http');
var util = require('util');
var gulp = require('gulp');
var del = require('del');
var runSequence = require('run-sequence');
var through = require('through2');
var gutil = require('gulp-util');
var lazypipe = require('lazypipe');
var express = require('express');

function ensureTrailingSlash(webpath) {

    if (webpath[webpath.length - 1] !== '/') {
        webpath += '/';
    }

    return webpath;
}

var ContentDirectory = require('./build-tasks/ContentDirectory');

var middleware = {
    errorHandler: require('./build-tasks/middleware/ErrorHandler'),
    consoleErrorHandler: require('./build-tasks/middleware/ConsoleErrorHandler'),
    pipeline: require('./build-tasks/middleware/Streams'),
    replace: require('./build-tasks/middleware/replace'),
};

var $ = require('gulp-load-plugins')();
$.esmodern = require('./build-tasks/gulp/gulp-esmodern');
$.inlinesvg = require('./build-tasks/gulp/gulp-inlinesvg');

// configuration

var rootDirectory = 'src';
var serveDirectory = 'build-tasks/serve';
var buildDirectory = 'build';

// initialize express web server

var app = express();

//

var diskCache = new $.cacheable.DiskCacheProvider('.buildcache');

// pipelines

var pipelines = {

    css: lazypipe()
        .pipe($.sourcesLess, { sourceMap: true, relativeUrls: true })
        .pipe($.autoprefixer, 'last 1 version')
        .pipe($.inlinesvg, { base: rootDirectory }),

    js: lazypipe()
        .pipe(through.obj),

};

// gulp build tasks

gulp.task('css', function() {

    return $.plumber()
        .pipe(gulp.src('css/**/*.less', { cwd: rootDirectory, base: rootDirectory }))
        .pipe($.cacheable.start({ cacheProvider: diskCache }))
        .pipe(pipelines.css())
        .pipe($.minifyCss())
        .pipe($.cacheable.stop())
        .pipe($.size({ title: 'CSS' }))
        .pipe(gulp.dest(buildDirectory));

});

gulp.task('js', function() {

    return $.plumber()
        .pipe(gulp.src('js/**/*.js', { cwd: rootDirectory, base: rootDirectory }))
        .pipe($.cacheable.start({ cacheProvider: diskCache }))
        .pipe(pipelines.js())
        .pipe($.esmodern({ formatter: 'bundle' }))
        .pipe($.uglify({ mangle: false }))
        .pipe($.cacheable.stop())
        .pipe($.size({ title: 'JS' }))
        .pipe(gulp.dest(buildDirectory));

});

gulp.task('copy', function() {

    return $.plumber()
        .pipe(gulp.src(['src/**/*', '!src/css/**/*.less', '!src/js/**/*.js']))
        .pipe($.imagemin())
        .pipe($.size({ title: 'Content' }))
        .pipe(gulp.dest(buildDirectory));

});

// express debug

app.pipeline = function(pipeline) {

    var errorHandler = function(req, res, err, next) {
        if (err.code !== 'ENOENT') return next(err);
        next();
    };

    var resolver = function(webpath) {
        return
    };

    pipeline.error = pipeline.error || errorHandler;
    pipeline.resolver = pipeline.resolver || resolver;

    app.use(middleware.pipeline(pipeline));
};

gulp.task('serve', function(cb) {

    var server = http.createServer(app);

    app.use('/_serve', express.static(serveDirectory));

    // inject plsload script file at the top of the <head>
    app.use(middleware.replace('<head>', '<head><script src="/_serve/plsload.js"></script>'));

    app.pipeline({
        pattern: '**/*.css',
        resolver: function(webpath) {
            return path.join(rootDirectory, gutil.replaceExtension(webpath, '.less'));
        },
        pipe: lazypipe()
            .pipe($.cacheable.start)
            .pipe(pipelines.css)
            .pipe($.cacheable.stop)
    });

    app.pipeline({
        pattern: '**/*.js',
        resolver: function(webpath) {
            return path.join(rootDirectory, webpath);
        },
        pipe: lazypipe()
            .pipe($.cacheable.start)
            .pipe(pipelines.js)
            .pipe($.esmodern)
            .pipe($.cacheable.stop)
    });

    app.use(express.static(rootDirectory));

    app.use(middleware.consoleErrorHandler());
    app.use(middleware.errorHandler());

    server.listen(9001, '0.0.0.0', function(err) {
        gutil.log(util.format('Express web server running at http://localhost:%s', server.address().port));
    });

});

gulp.task('clean', function(cb) {
    del('build', cb);
});

gulp.task('build', function(cb) {
    runSequence('clean', 'css', 'js', 'copy', cb);
});

gulp.task('default', ['build']);
