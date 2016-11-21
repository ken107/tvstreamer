
var request = require("request");

exports.time = time;
exports.dedupe = dedupe;
exports.cache = cache;
exports.splitLines = splitLines;
exports.stripQuery = stripQuery;
exports.download = dedupe(download);
exports.toBase64 = toBase64;
exports.fromBase64 = fromBase64;
exports.acceptLanguage = "en-US,en;q=0.8,vi;q=0.6";
exports.userAgent = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36";

function time() {
	var dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	var now = new Date();
	return dayOfWeek[now.getDay()] + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
}

function dedupe(loadFunc) {
  var pending = {};
  return function(uri) {
      if (pending[uri]) return pending[uri];
      return pending[uri] = loadFunc.apply(this, arguments)
        .then(result => {
          delete pending[uri];
          return result;
        });
  };
}

function cache(expire, loadFunc) {
	var cache = {};
	return function(uri) {
		if (cache[uri] && cache[uri].time + expire > new Date().getTime()) return Promise.resolve(cache[uri].data);
		return loadFunc.apply(this, arguments)
			.then(result => {
				cache[uri] = {data: result, time: new Date().getTime()};
				return result;
			});
	};
}

function splitLines(content) {
	return content.split(/\r?\n/).map(line => line.trim());
}

function stripQuery(url) {
	var urlObj = require("url").parse(url);
	return require("url").format({
		protocol: urlObj.protocol,
		host: urlObj.host,
		pathname: urlObj.pathname
	});
}

function download(url, headers) {
	console.log(time(), "load", url);
	return new Promise(function(fulfill, reject) {
		request({
			url: url,
			headers: headers,
			gzip: true
		},
		(err, res, body) => {
			if (err) reject(err);
			else if (res.statusCode != 200) reject(`HTTP ${res.statusCode}`);
			else fulfill(body);
		});
	})
}

function toBase64(s) {
	return new Buffer(s).toString('base64');
}

function fromBase64(s) {
	return new Buffer(s, 'base64').toString('ascii');
}
