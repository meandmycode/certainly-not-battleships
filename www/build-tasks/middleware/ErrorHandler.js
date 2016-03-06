var util = require('util');
var connect = require('connect');

module.exports = function() {
	return function(err, req, res, next) {

		var html = util.format('<!doctype html><html><body><pre><h1>%s in %s</h1>%s</pre></body></html>',
			err.name,
			err.fileName,
			err.message
			// connect.utils.escape(err.toString()).replace(/\n/g, '<br>')
		);

        res.status(500).send(html);

	};
};
