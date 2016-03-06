var ESModernUtils = require('./esmodern-utils');
var Babel = require('babel');
var Transpiler = require('es6-module-transpiler');
var FileResolver = Transpiler.FileResolver;


var ESModernFileResolver = module.exports = function ESModernFileResolver(babelOptions, paths) {
    FileResolver.call(this, paths);
    this._babelOptions = babelOptions;
};

ESModernFileResolver.prototype = Object.create(FileResolver.prototype);
ESModernFileResolver.prototype.constructor = ESModernFileResolver;

ESModernFileResolver.prototype.resolveModule = function(importedPath, fromModule, container) {

    var mod = FileResolver.prototype.resolveModule.apply(this, arguments);

    if (mod == null) return mod;

    var babelOptions = this._babelOptions;

    var src;

    return Object.create(mod, {

        reload: function() {
            delete src;
            mod.reload();
        },

        src: {
            enumerable: true,
            get: function() {
                return src || (src = Babel.transform(mod.src, babelOptions).code);
            },
            set: function(value) {
                return src = value;
            }
        }

    });

};
