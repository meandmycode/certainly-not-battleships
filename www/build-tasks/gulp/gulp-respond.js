var path = require('path');
var through = require('through2');

module.exports = function respond(req, res) {

	return through.obj(function(file, enc, cb) {

		res.type(path.extname(file.relative));
		res.header('Cache-Control', 'public, must-revalidate');
		res.header('Vary', 'If-None-Match');

		if (file.isStream()) {
			file.contents.pipe(res);
		} else {
			res.send(file.contents);
		}

		cb(null, file);

	});

};
