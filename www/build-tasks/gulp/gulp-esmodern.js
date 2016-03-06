var fs = require('fs');
var path = require('path');
var through = require('through2');
var FileSources = require('vinyl-sources');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

var Transpiler = require('es6-module-transpiler');
var Container = Transpiler.Container;
var FileResolver = Transpiler.FileResolver;
var ESModernFileResolver = require('./esmodern-file-resolver');
var ESModernUtils = require('./esmodern-utils');

// hacky but we MUST reuse the recast instance that transpiler uses as recast has instance type checks
var recast = require('es6-module-transpiler/node_modules/recast');

function getFormatter(type) {
    // todo: remove once plsload is npm published
    if (type === 'plsload') return require('./es6-module-transpiler-plsload-formatter');
    return Transpiler.formatters[type] || require('es6-module-transpiler-' + type + '-formatter');
}

module.exports = function (options) {

    options = options || {};

    var baseDir = options.baseDir || '';
    var formatterType = options.formatter || 'plsload';
    var formatterFn = getFormatter(formatterType);

    var babelOptions = options.babel || {
        compact: options.compact || false,
        stage: options.stage || 0,
        blacklist: ['useStrict', 'es6.modules']
    };

    return through.obj(function(file, encoding, callback) {

        try {

            var src = file.contents.toString();

            var resolver = new ESModernFileResolver(babelOptions, [baseDir]);

            var formatter = new formatterFn();

            var container = new Container({
                resolvers: [resolver],
                formatter: formatter
            });

            container.getModule(path.relative(baseDir, file.path));

            var files = container.convert();
            var result = files[0];

            var rendered = recast.print(result);

            // todo: here we assume bundle means all modules are included in the source,
            // whilst this is a strong assumption, ideally we knew exactly which sources
            // were part of the formatted source.
            if (formatterType === 'bundle') {

                var sources = container.getModules().map(function(dependency) {
                    return dependency.path;
                });

                FileSources.record(file, sources);

            } else {

                // todo: remove once gulp-cacheable automatically infers this
                FileSources.record(file, [file.path]);

            }

            file.contents = new Buffer(rendered.code);

            callback(null, file);

        } catch(err) {

            callback(new PluginError('gulp-esmodern', err));

        }

    });

};
