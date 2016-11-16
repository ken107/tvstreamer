
var express = require("express");
var cors = require("cors");
var app = express();
app.use(cors());
app.get("/:source/:channel/:playlist.m3u8", (req, res) => {
	require(`./scraper/${req.params.source}.js`)
		.getPlaylist(req.params.channel, req.params.playlist, res);
});
app.get("/:source/:channel/:stream.ts", (req, res) => {
	require(`./scraper/${req.params.source}.js`)
		.getStream(req.params.channel, req.params.stream, res);
});
app.listen(30111, () => console.log("Listening on 30111"));
