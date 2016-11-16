
var express = require("express");
var app = express();
app.get("/data", (req, res) => res.json(data));
app.listen(30111);

var sources = {
	vtv: require("./scraper/vtv.js")
};
var data = {};
for (var name in sources) {
	update(name);
	if (!sources[name].updateInterval) throw "Missing update interval";
	setInterval(update.bind(null, name), sources[name].updateInterval);
}

function update(name) {
	sources[name].scrape()
		.then(result => {
			data[name] = result;
			console.log(time(), name, "updated");
		})
		.catch(err => console.log(time(), name, err.stack));
}

function time() {
	var dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	var now = new Date();
	return dayOfWeek[now.getDay()] + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
}
