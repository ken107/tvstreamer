
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
			else fulfill(res.headers['location']);
		});
	});
}

exports.scrape = function() {
	var data = [];
	var push = result => data.push(result);
	return
		scrape(i).then(result => {
			data.push({
				name: `VTV${i}`,
				m3u8: result
			});

		});
		.then(() => scrape(2)).then(push)
		.then(() => scrape(3)).then(push)
		.then(() => scrape(4)).then(push)
		.then(() => scrape(5)).then(push)
		.then(() => scrape(6)).then(push)
		.then(() => scrape(7)).then(push)
		.then(() => scrape(8)).then(push)
		.then(() => scrape(9)).then(push)
		.then(() => data);
}

exports.updateInterval = 3*60*1000;
