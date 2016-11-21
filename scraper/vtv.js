
var request = require("request");
var helper = require("../util/helper.js");

var masterUrls = {};

exports.getPlaylist = function(channel, playlist, res) {
	return getMasterUrl(channel)
		.then(masterUrl => {
			if (playlist == "master.m3u8") return downloadPlaylist(masterUrl);
			else {
				url = require("url").resolve(masterUrl, playlist);
				return downloadPlaylist(url)
					.then(helper.splitLines)
					.then(lines => lines.map(line => !line || line.startsWith("#") ? line : require("url").resolve(url, line)))
					.then(lines => lines.join("\r\n"));
			}
		})
		.then(content => res.send(content));
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
				Referer: `http://vtv.vn/truyen-hinh-truc-tuyen/vtv${channel}.htm`
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

function downloadPlaylist(url) {
	return helper.download(url, {
		"User-Agent": helper.userAgent,
		Referer: `http://vcplayer.vcmedia.vn/1.1/?_site=livevtv&ads=false&vid=dnR2MQ==&live=%2F%2F123.30.215.43%2Fhls%2F4545780bfa790819%2F4%2F1%2F34a6c983582026352668470d85fe5c02488dc9fccb370e3a2a78c3147d0c1bfd%2FdnR2MQ%3D%3DbWFzdGVy.m3u8&poster=https%3A%2F%2Ftvstatic.vcmedia.vn%2Fvtv%2Fvtv1-thumb.jpg%3Ft%3D1465188650%26t%3D1479325421&autoplay=&autoplay=true`
	});
}
