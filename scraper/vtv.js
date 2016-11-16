
var request = require("request");
//request.debug = true;

function scrape(index) {
	var key = new Buffer(`vtv${index}`).toString("base64");
	return new Promise(function(fulfill, reject) {
		request({
			url: `http://play.sohatv.vn/?v=${key}&autoplay=true`,
			headers: {
				//"User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36",
				referer: `http://vtv.vn/truyen-hinh-truc-tuyen/vtv${index}.htm`
			},
			followRedirect: false
		},
		(err, res) => {
			if (err) reject(err);
			else if (res.statusCode != 302) reject(`Expect 302 but get ${res.statusCode}`);
			else fulfill({
				name: `VTV${index}`,
				m3u8: res.headers['location']
			});
		});
	});
}

exports.scrape = function() {
	var data = [];
	var i = 0;
	return next();
	function next() {
		if (++i > 9) return Promise.resolve(data);
		else return scrape(i).then(result => data.push(result)).then(next);
	}
}

exports.updateInterval = 3*60*1000;
