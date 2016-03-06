var AMDFormatter = require('es6-module-transpiler-amd-formatter');

var PlsLoadFormatter = module.exports = function PlsLoadFormatter() {
    AMDFormatter.call(this);
};

PlsLoadFormatter.prototype = Object.create(AMDFormatter.prototype);
PlsLoadFormatter.prototype.constructor = PlsLoadFormatter;

PlsLoadFormatter.prototype.build = function(modules) {

    return AMDFormatter.prototype.build.call(this, modules).map(function(ast) {

        var body = ast.program.body;
        var define = body[0];
        var factory = define.expression.arguments[define.expression.arguments.length - 1].body;

        // rename the define call to plsload
        define.expression.callee.name = 'plsload';

        // remove the module name, we key modules based on their url
        define.expression.arguments.shift();

        // amd enables strict mode, but plsload needs to be more permissive
        factory.body.shift();

        return ast;

    });

};
