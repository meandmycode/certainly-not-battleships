var fs = require('fs');
var path = require('path');
var Promise = require('Promise');
var readFile = Promise.denodeify(fs.readFile);
var glob = Promise.denodeify(require('glob'));
var stat = Promise.denodeify(fs.stat);
var through = require('through2');
var extend = require('node.extend');
var yaml = require('js-yaml');
var vinylfs = require('vinyl-fs');

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function replaceExtension(filePath, replacement) {
    var extname = path.extname(filePath);
    if (extname.length > 0) filePath = filePath.slice(0, -extname.length);
    return filePath + replacement;
}

function getEffectiveWebpath(file, options) {

    var extname = path.extname(file.path);
    var fileName = path.basename(file.path, extname);
    var isIndex = fileName === options.index;

    var relativePath = isIndex
        ? path.dirname(file.relative) + path.sep
        : replaceExtension(file.relative, options.extname);

    // reduce current path
    if (relativePath === ('.' + path.sep)) relativePath = '';

    var webPath = '~/' + replaceAll(relativePath, path.sep, '/');

    return webPath;

}

var defaults = {
    index: 'index',
    extname: '.html',
    parsers: {
        '.yaml': yaml.safeLoad
    }
};

module.exports.getContents = function getContents(basePath) {
    return vinylfs.src('**/!(_).*', { cwd: basePath, base: basePath, read: false });
};

function getPathParts(webPath) {

    if (webPath.slice(0, 2) === '~/') webPath = webPath.slice(2);

    return webPath.split('/');

}

module.exports.read = function read(options) {

    options = extend({}, defaults, options);

    var cache = {};

    return through.obj(function(file, enc, callback) {

        try {

            var fileName = path.basename(file.path);

            var relativePath = file.relative;

            var webPath = getEffectiveWebpath(file, options);
            var webPathParts = getPathParts(webPath);

            var pathDepth = webPathParts.length;
            var rootPath = new Array(pathDepth).join('../') || '.';

            var base = {
                pathname: webPath,
                rootPath: rootPath,
                pathDepth: pathDepth
            };

            var abstracts = (path.sep + relativePath).split(path.sep).reduce(function(set, item, i, items) {

                var filePath = path.join.apply(path, items.slice(0, i + 1));

                var isFileItem = i === items.length - 1;

                // the file item is the actual target file of the #read, it is considered abstract if it does not contain an extension
                if (isFileItem) {
                    var isAbstract = path.extname(filePath).length === 0;
                    set.push(path.join(file.base, filePath + (isAbstract ? '.*' : '')));
                } else {
                    set.push(path.join(file.base, filePath, '_.*'));
                }

                return set;

            }, []);

            var physicals = abstracts.map(function(abstractPath, i, items) {

                return glob(abstractPath).then(function(possibilities) {

                    var isFileItem = i === items.length - 1;

                    // no page content
                    if (!possibilities.length) return;

                    // if more than one possibility, throw an Error
                    if (possibilities.length > 1) throw new Error('MULTIPLE_POSSIBLE_CONTENT_FILES'); // todo:

                    return possibilities[0];

                });

            });

            var contents = physicals.map(function(physicalPath) {

                return physicalPath.then(function(physicalPath) {

                    // we're running promises in sync arrays, some of the queries for content files may result in nothing found
                    if (!physicalPath) return;

                    // we stat the file and check our memory cache to see if we've already parsed this content file
                    return stat(physicalPath).then(function(stat) {

                        var cacheKey = physicalPath + +stat.mtime;

                        if (cacheKey in cache) return cache[cacheKey];

                        return cache[cacheKey] = readFile(physicalPath, 'utf8').then(function(raw) {

                            var extension = path.extname(physicalPath);
                            var parser = options.parsers[extension];

                            if (parser == null) throw new Error('No parser found for \''+physicalPath+'\'.')

                            try {

                                var content = parser(raw);

                                return {
                                    path: physicalPath,
                                    content: content
                                };

                            } catch (err) {
                                err.fileName = physicalPath;
                                throw err;
                            }

                        });

                    });

                });

            });

            Promise.all(contents).then(function(contents) {

                var targetFile = contents[contents.length - 1];

                if (targetFile == null) {
                    var err = new Error('NO_TARGET_FOUND \'' + file.path + '\''); // todo:
                    err.code = 'ENOENT';
                    return callback(err);
                }

                var content = contents.reduce(function(base, content) {
                    return content ? extend({}, base, content.content) : base;
                }, base);

                file.model = content;
                file.path = targetFile.path;

                callback(null, file);

            }).catch(callback);

        } catch(err) {

            callback(err);

        }

    });

};
