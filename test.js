
var res = {
  send: console.log
}

require("./scraper/vtv.js").getPlaylist(1, "master", res).catch(console.log);
