
function f() {
require("./scraper/vtv.js").scrape()
  .then(console.log)
  .catch(console.log);
}

var request = require("request");

request({
  url: "http://123.30.215.43/hls/4545780bfa790819/4/1/d9f1c8ca6a5eeb5d43d4a07f885ad0d195f6928b8ba4efe1cf237a22fc6f6b64/dnR2MQ==bWFzdGVy.m3u8?orientation=1",
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36",
    referer: `http://vcplayer.vcmedia.vn/1.1/?_site=livevtv&ads=false&vid=dnR2MQ==&live=%2F%2F123.30.215.43%2Fhls%2F4545780bfa790819%2F4%2F1%2F34a6c983582026352668470d85fe5c02488dc9fccb370e3a2a78c3147d0c1bfd%2FdnR2MQ%3D%3DbWFzdGVy.m3u8&poster=https%3A%2F%2Ftvstatic.vcmedia.vn%2Fvtv%2Fvtv1-thumb.jpg%3Ft%3D1465188650%26t%3D1479325421&autoplay=&autoplay=true`
  },
  gzip: true
},
(err, res, body) => {
  if (err) console.log(err);
  else console.log(res.statusCode, body);
});
