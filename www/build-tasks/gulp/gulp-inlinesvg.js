var path = require('path');
var fs = require('fs');
var Promise = require('promise');
var readFile = Promise.denodeify(fs.readFile);
var gutil = require('gulp-util');
var through = require('through2');
var rework = require('rework');
var URL = require('url');
var File = require('vinyl');
var cheerio = require('cheerio');
var SVGO = require('svgo');
var sources = require('vinyl-sources');

function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}

function isString(str) {
    return typeof str == 'string' || str instanceof String;
}

var defaultVisitors = {
    rule: function(node) {
        return node;
    },
    media: function(node, visit) {
        node.rules = node.rules.map(visit);
        return node;
    },
    sheet: function(node, visit) {
        node.rules = node.rules.map(visit);
        return node;
    }
};

function visit(node, visitors) {

    visitors = extend({}, defaultVisitors, visitors);

    return visitCore(node, visitors);

}

function visitCore(node, visitors) {

    if (node == null) return node;

    var visitor = visitors[node.type || 'sheet'];

    if (visitor == null) return node;

    return visitor(node, function(node) {
        return visitCore(node, visitors);
    });

}

module.exports = function(options) {

    var svgo = new SVGO();

    return through.obj(function(file, enc, cb) {

        var self = this;

        // pass along
        if (file.isNull()) return cb(null, file);

        var basedir = path.resolve(options.base);
        var dirname = path.dirname(file.path);

        var ret = rework(file.contents.toString());

        var matches = [];
        var styles = {};

        function normalizePath(csspath) {
            var isRooted = csspath[0] === '/';
            return path.join(isRooted ? basedir : dirname, csspath)
        }

        // first we need to collect all the svg paths so we can eagerly load them in for our next pass where we replace them
        ret.use(function(sheet) {

            visit(sheet, {
                rule: function(rule) {

                    if (Array.isArray(rule.declarations)) {

                        rule.declarations = rule.declarations.map(function(declaration) {

                            if (isString(declaration.value)) {

                                declaration.value = declaration.value.replace(/\burl\(([^)]+)\)/gi, function(rawurl, csspath) {

                                    var url = URL.parse(csspath);

                                    var ext = path.extname(url.pathname);

                                    if (ext === '.svg') matches.push({ url: rawurl, path: normalizePath(url.pathname), options: (url.hash && url.hash.slice(1)) || '' });

                                    return rawurl;

                                });

                            }

                            return declaration;

                        });

                    }

                    return rule;

                },
                media: function(rule) {

                    if (rule.media.slice(0, 2) === '--') {

                        styles[rule.media.slice(2)] = rule.rules;

                    }

                    return rule; // todo: return null?

                }
            });

        });

        var svgs = matches.map(function(svg) {

            return readFile(svg.path, 'utf8').then(function(content) {

                var svgDocument = cheerio.load(content);

                var styleName = (svg.options.match(/style=(.+)/) || [])[1];
                var svgStyles = styles[styleName];

                var fill = (svg.options.match(/fill=(.+)/) || [])[1];

                if (svgStyles) {

                    svgStyles.forEach(function(rule) {

                        var elements = svgDocument(rule.selectors.join(', '));

                        rule.declarations.forEach(function(declaration) {

                            elements.attr(declaration.property, declaration.value)

                        });

                    });

                } else if (fill) {
                    svgDocument('svg').attr('fill', fill);
                }

                content = svgDocument.xml();

                return new Promise(function(resolve, reject) {

                    svgo.optimize(content, function (res) {

                        var file = new File({
                            path: svg.path
                        });

                        file.stat = fs.statSync(svg.path); // todo:
                        file.contents = new Buffer(res.data);
                        file.url = svg.url;

                        resolve(file);

                    });

                });

            });

        });

        // once we're loaded all the svgs in, we'll do our second rewrite pass and actually replace the content with loaded (and optimised) svg content
        Promise.all(svgs).then(function(svgs) {

            svgs = svgs.filter(function(svg) { return svg != null });

            var lookup = svgs.reduce(function(agg, svg) {

                agg[svg.url] = svg;

                return agg;

            }, {});

            ret.use(function(sheet) {

                visit(sheet, {
                    rule: function(rule) {

                        if (Array.isArray(rule.declarations)) {

                            rule.declarations = rule.declarations.map(function(declaration) {

                                if (isString(declaration.value)) {

                                    declaration.value = declaration.value.replace(/\burl\(([^)]+)\)/gi, function(rawurl, csspath) {

                                        var svg = lookup[rawurl];

                                        if (svg == null) return rawurl;

                                        return 'url(data:image/svg+xml;charset=US-ASCII,' + escape(svg.contents.toString()) + ')';

                                    });

                                }

                                return declaration;

                            });

                        }

                        return rule;

                    }
                });

            });

            // work around for https://github.com/meandmycode/vinyl-sources/issues/3
            var svgPaths = svgs.map(function(file) {
                return file.path;
            });

            sources.record(file, svgPaths);
            file.contents = new Buffer(ret.toString());

            cb(null, file);

        }).catch(cb);

    });

};
