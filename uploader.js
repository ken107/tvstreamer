var http = require("http");
var fs = require("fs");
var stream = require("stream");
var lastModified = {};
var uploader = new Uploader();
var folder = "media/";

init();

function init() {
  var file = "a.m3u8";
  fs.watchFile(folder+file, {interval: 1007}, (stat, prev) => {
    if (stat.mtime.getTime() == prev.mtime.getTime()) return;
    if (uploader.queue.length > 15) {
      console.log("Queue too long, starting over");
      uploader.queue = [];
      lastModified = {};
    }
    fs.readFile(folder+file, "utf8", (err, data) => {
      if (err) throw err;
      parsePlaylist(file, data);
    });
  });
}

function parsePlaylist(file, data) {
  var lines = data.split(/\r?\n/).map(x => x.trim());
  var files = lines.filter(x => x && !/^#/.test(x));
  getStats(files, stats => {
    for (var i=0; i<files.length; i++) checkAndUpload(files[i], stats[i]);
    uploader.add(file, data);
  });
}

function checkAndUpload(file, stat) {
  if (stat.mtime.getTime() != lastModified[file]) {
    lastModified[file] = stat.mtime.getTime();
    uploader.add(file);
  }
}

function getStats(files, callback) {
  var stats = files.map(file => null);
  files.forEach((file, index) => {
    fs.stat(folder+file, (err, stat) => {
      if (err) throw err;
      stats[index] = stat;
      if (stats.every(x => x)) callback(stats);
    });
  });
}

function Uploader() {
  this.queue = [];
  this.active = false;

  this.add = function(file, data) {
    this.queue.push({file: file, data: data});
    if (!this.active) {
      this.active = true;
      this.uploadNext();
    }
  };

  this.uploadNext = function() {
    if (!this.queue.length) {
      this.active = false;
      return;
    }
    var item = this.queue.shift();
    if (item.data) this.upload(item.file, item.data.length, item.data);
    else this.statAndUpload(item.file);
  };

  this.statAndUpload = function(file) {
    fs.stat(folder+file, (err, stat) => {
      if (err) throw err;
      this.upload(file, stat.size, fs.createReadStream(folder+file));
    });
  };

  this.upload = function(file, size, data) {
    var req = http.request({
      host: "titan.diepkhuc.com",
      method: "PUT",
      path: "/" + file,
      headers: {
        "Content-Length": size
      }
    },
    res => {
      res.resume();
      console.log(file, "-", res.statusCode, res.statusMessage);
      process.stdout.write(this.queue.length + " \r");
      this.uploadNext();
    });
    req.on("error", err => {
      console.log(file, "-", err);
      process.stdout.write(this.queue.length + " \r");
      if (data instanceof stream.Readable) setTimeout(() => this.statAndUpload(file), 5000);
      else setTimeout(() => this.upload(file, size, data), 5000);
    });
    if (data instanceof stream.Readable) data.pipe(req);
    else req.end(data);
  };
}
