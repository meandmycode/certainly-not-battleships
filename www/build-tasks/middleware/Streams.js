var fs = require('fs');
var util = require('util');
var minimatch = require('minimatch');
var through = require('through2');
var File = require('vinyl');
var path = require('path');
var gutil = require('gulp-util');

var respond = require('../gulp/gulp-respond');
var plumber = require('gulp-plumber');

function getFileDescriptor(maybeDescriptor) {
    var isObject = Object(maybeDescriptor) === maybeDescriptor;
    return isObject ? maybeDescriptor : { path: maybeDescriptor };
}

module.exports = function(pipeline) {

    var match = pipeline.pattern;
    var pipeFactory = pipeline.pipe;

    var resolver = pipeline.resolver || function(webpath) {
        return {
            path: path.resolve(path.join('.', webpath))
        };
    };

    var read = typeof pipeline.read === 'boolean' ? pipeline.read : true;

    var errorHandler = pipeline.errorHandler || function(req, res, err, next) {
        next(err);
    };

    return function(req, res, next) {

        var start = Date.now();

        var relative = req.path;

        if (match && !minimatch(relative, match)) return next();

        var src = plumber(function(err) {
            handled = true;
            errorHandler(req, res, err, next);
        });

        var pipe = src
            .pipe(pipeFactory())
            .pipe(respond(req, res));

        var handled = false;

        pipe.once('data', function() {
            handled = true;
        });

        pipe.once('finish', function() {
            if (!handled) return next();
            gutil.log(util.format('%sms to render %s', Date.now() - start, relative));
        });

        var fileDescriptor = getFileDescriptor(resolver(relative));

        var file = new File(fileDescriptor);

        if (read) file.contents = new Buffer(fs.readFileSync(file.path));

        src.end(file);

    };

};
