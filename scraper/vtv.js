
var request = require("request");
var helper = require("../util/helper.js");
//request.debug = true;

var masterUrls = {};
var pending = {};

exports.getPlaylist = function(channel, playlist, res) {
	return getMasterUrl(channel)
		.then(masterUrl => {
			if (playlist == "master") return download(masterUrl);
			else return download(require("url").resolve(masterUrl, playlist + ".m3u8"));
		})
		.then(content => res.send(content));
}

exports.getStream = function(channel, stream, res) {
	return getMasterUrl(channel)
		.then(masterUrl => res.redirect(302, require("url").resolve(masterUrl, stream + ".ts")));
}

function getMasterUrl(channel) {
	if (masterUrls[channel] && new Date().getTime() < masterUrls[channel].expire) {
	 	return Promise.resolve(masterUrls[channel].url);
	}
	else {
		return scrapeMasterUrl(channel)
			.then(url => {
				masterUrls[channel] = {url: url, expire: new Date().getTime() + 3*60*1000};
				return url;
			});
	}
}

function scrapeMasterUrl(channel) {
	var key = new Buffer(`vtv${channel}`).toString("base64");
	return new Promise(function(fulfill, reject) {
		request({
			url: `http://play.sohatv.vn/?v=${key}&autoplay=true`,
			headers: {
				//"User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36",
				referer: `http://vtv.vn/truyen-hinh-truc-tuyen/vtv${channel}.htm`
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

function download(url) {
	if (pending[url]) return pending[url];
	return pending[url] = load(url)
		.then(result => {
			delete pending[url];
			return result;
		})
}

function load(url) {
	console.log(helper.time(), "load", url);
	return new Promise(function(fulfill, reject) {
		request({
			url: url,
			headers: {
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36",
				referer: `http://vcplayer.vcmedia.vn/1.1/?_site=livevtv&ads=false&vid=dnR2MQ==&live=%2F%2F123.30.215.43%2Fhls%2F4545780bfa790819%2F4%2F1%2F34a6c983582026352668470d85fe5c02488dc9fccb370e3a2a78c3147d0c1bfd%2FdnR2MQ%3D%3DbWFzdGVy.m3u8&poster=https%3A%2F%2Ftvstatic.vcmedia.vn%2Fvtv%2Fvtv1-thumb.jpg%3Ft%3D1465188650%26t%3D1479325421&autoplay=&autoplay=true`
			},
			gzip: true
		},
		(err, res, body) => {
			if (err) reject(err);
			else if (res.statusCode != 200) reject(`HTTP ${res.statusCode}`);
			else fulfill(body);
		});
	})
}
