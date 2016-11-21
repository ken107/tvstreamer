
var request = require("request");
var helper = require("../util/helper.js");

var masterUrls = {};

exports.getPlaylist = function(channel, playlist, res) {
	return getMasterUrl(channel)
		.then(masterUrl => {
			if (playlist == "master.m3u8") return downloadPlaylist(masterUrl, channel);
			else {
				var url = require("url").resolve(masterUrl, playlist);
				return downloadPlaylist(url, channel)
					.then(helper.splitLines)
					.then(lines => lines.map(line => !line || line.startsWith("#") ? line : require("url").resolve(url, line)))
					.then(lines => lines.map(line => interceptKeyFileUri(line, channel)))
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
				masterUrls[channel] = {url: url, expire: new Date().getTime() + 15*60*1000};
				return url;
			});
	}
}

function scrapeMasterUrl(channel) {
	return new Promise(function(fulfill, reject) {
		request.post({
			url: "https://fptplay.net/show/getlinklivetv",
      form: {
        id: channel,
        type: "changechannel",
        quality: 3,
        mobile: "web"
      },
			headers: {
        Accept: "application/json, text/javascript, */*; q=0.01",
				"Accept-Language": helper.acceptLanguage,
				Referer: `https://fptplay.net/livetv/${channel}`,
				"User-Agent": helper.userAgent,
				Origin: "https://fptplay.net",
				"X-KEY": 123456,
				"X-Requested-With": "XMLHttpRequest"
			},
			gzip: true
		},
		(err, res, body) => {
			if (err) reject(err);
			else if (res.statusCode != 200) reject(`HTTP ${res.statusCode}`);
			else fulfill(JSON.parse(body).stream);
		});
	});
}

function downloadPlaylist(url, channel) {
	return helper.download(url, {
		Accept: "*/*",
		"Accept-Language": helper.acceptLanguage,
		Referer: `https://fptplay.net/livetv/${channel}`,
		"User-Agent": helper.userAgent,
		"X-Requested-With": "ShockwaveFlash/23.0.0.207"
	});
}

function interceptKeyFileUri(line, channel) {
	return line.replace(/^(#EXT-X-KEY:.*URI=")(.*?)(".*)$/, (m, m1, m2, m3) => {
		var data = helper.toBase64(JSON.stringify({
			url: m2,
			headers: {
				Accept: "*/*",
				"Accept-Language": helper.acceptLanguage,
				Referer: `https://fptplay.net/livetv/${channel}`,
				"User-Agent": helper.userAgent,
				"X-Requested-With": "ShockwaveFlash/23.0.0.207"
			}
		}));
		return `${m1}proxy?data=${data}${m3}`;
	});
}
