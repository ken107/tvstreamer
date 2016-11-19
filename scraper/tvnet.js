
var request = require("request");
var helper = require("../util/helper.js");

var master;

exports.getPlaylist = function(channel, playlist, res) {
  if (playlist == "master") {
    if (master) {
      return loadM3u8(channel, master)
        .then(content => res.send(content))
        .catch(err => {
          master = null;
          return exports.getPlayerlist(channel, playlist, res);
        });
    }
    else {
      return getSources(channel)
        .then(sources => master = sources[0].url)
        .then(url => loadM3u8(channel, url))
        .then(content => res.send(content));
    }
  }
  else {
    loadM3u8(require("url").resolve(master, playlist + ".m3u8" + require("url").parse(master).search))
      .then(content => res.send(content));
  }
}

function getSources(channel) {
  return new Promise(function(fulfill, reject) {
    request({
      url: `http://118.107.85.21:1337/get-stream.json?p=smil:${channel}.smil&t=l&ott=Web_Other&ip=::1`,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36",
        referer: `http://us.tvnet.gov.vn/kenh-truyen-hinh/1018/${channel}`
      },
      gzip: true
    },
    (err, res, body) => {
      if (err) reject(err);
      else if (res.statusCode != 200) reject(`HTTP ${res.statusCode}`);
      else fulfill(JSON.parse(body));
    });
  });
}

var loadM3u8 = helper.dedupe(function(channel, url) {
  console.log(helper.time(), "load", url);
	return new Promise(function(fulfill, reject) {
		request({
			url: url,
			headers: {
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36",
        referer: `http://us.tvnet.gov.vn/kenh-truyen-hinh/1018/${channel}`
			},
			gzip: true
		},
		(err, res, body) => {
			if (err) reject(err);
			else if (res.statusCode != 200) reject(`HTTP ${res.statusCode}`);
			else fulfill(unresolveAbsolutePlaylistUrls(body, url));
		});
	})
});

function unresolveAbsolutePlaylistUrls(body, baseUrl) {
	return body.split(/\r?\n/).map(line => {
		line = line.trim();
//		if (!/^#/.test(line) && /\.ts$/.test(line)) return require("url").resolve(baseUrl, line);
		else return line;
	})
	.join("\r\n");
}
