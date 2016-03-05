var ReplaceStream = require('binary-stream-replace');
var onHeaders = require('on-headers')

module.exports = function replace(match, replacement) {

    var matchBuffer = new Buffer(match);
    var replacementBuffer = new Buffer(replacement);

    return function(req, res, next) {

        if (res._transform == null) {

            var previousWriteFn = res.write;
            var previousEndFn = res.end;

            var transform = ReplaceStream(matchBuffer, replacementBuffer, { maxOccurrences: 1 });

            // work around a bug in binary-stream-replace that assumes all streams
            // will first call .write(..) before .end(..), by writing some blank data
            transform.write([]);

            // redirect response stream to our transforming replace stream

            res.write = transform.write.bind(transform);
            res.end = transform.end.bind(transform);

            res._transform = transform;

            transform.on('data', function(chunk) {
                previousWriteFn.call(res, chunk);
            });

            transform.on('end', function(chunk) {
                previousEndFn.call(res, chunk);
            });

            onHeaders(res, function() {
                res.removeHeader('Content-Length');
            });

        }

        next();

    };

}
