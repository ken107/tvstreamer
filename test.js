
var helper = require("./util/helper");

require("./scraper/fptplay.js").getPlaylist("htvc-thuan-viet-hd", "master.m3u8", {send: onMaster}).catch(console.log);

function onMaster(content) {
  var lines = helper.splitLines(content);
  var playlist = lines.find(line => !line.startsWith("#"));
  require("./scraper/fptplay.js").getPlaylist("htvc-thuan-viet-hd", playlist, {send: onPlaylist}).catch(console.log);
}

function onPlaylist(content) {
  var m = content.match(/[\s\S]*URI="proxy\?data=(.*?)"/);
  var data = JSON.parse(helper.fromBase64(m[1]));
	helper.download(data.url, data.headers).then(console.log).catch(console.log);
}
