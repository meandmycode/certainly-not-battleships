var path = require('path');
var Promise = require('promise');
var gutil = require('gulp-util');
var through = require('through2');

module.exports = function(options) {

    // todo: better defaults merge
    options = options || {};

	return through.obj(function(file, enc, cb) {

        var relativePath = options.base ? path.relative(options.base, file.path) : file.relative

        var relativeDir = path.dirname(relativePath);

        var webPath = relativeDir === '.' ? '/' : '/' + relativeDir.replace(path.sep, '/') + '/';

        var webPathParts = webPath === '/' ? [] : webPath.slice(1, -1).split('/');
        var rootPath = webPathParts.map(function() { return '..'; }).join('/') || '.';

        if (file.isBuffer() === false) return cb(new Error('NON_BUFFER_NOT_SUPPORTED'));

        var contents = String(file.contents)
            .replace(/("|')~\//g, '$1' + rootPath + '/');

        file.contents = new Buffer(contents);

        cb(null, file);

	});

};
