
var express = require("express");
var cors = require("cors");
var app = express();
app.use(cors());
app.get("/:source/:channel/playlist/:playlist", (req, res) => {
	require(`./scraper/${req.params.source}.js`)
		.getPlaylist(req.params.channel, req.params.playlist, res);
});
app.get("/:source/:channel/proxy", (req, res) => {
	var data = JSON.parse(helper.fromBase64(req.query.data));
	return helper.download(data.url, data.headers);
});
app.listen(30111, () => console.log("Listening on 30111"));
