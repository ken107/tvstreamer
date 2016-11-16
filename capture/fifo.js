var q = require("fifo")();
var ok = true;

process.stdin.on('data', (chunk) => {
  if (q.length > 50) throw "Buffer overflow";
  q.push(chunk);
  write();
});

function write() {
  while (ok && q.length) ok = process.stdout.write(q.shift());
}

process.stdout.on('drain', () => {
  ok = true;
  write();
});
