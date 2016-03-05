var util = require('util');
var gutil = require('gulp-util');

function error() {
  var time = '['+gutil.colors.red(gutil.date(new Date(), 'HH:MM:ss'))+']';
  var args = Array.prototype.slice.call(arguments);
  args.unshift(time);
  console.error.apply(console, args);
  return this;
};

module.exports = function() {
    return function(err, req, res, next) {

        // todo: gutil.error when this is resolved https://github.com/gulpjs/gulp-util/issues/33

        error(err.message);
        if (err.stack) console.log(err.stack);
        next(err);

    };
};
