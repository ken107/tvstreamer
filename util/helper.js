
exports.time = function() {
	var dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	var now = new Date();
	return dayOfWeek[now.getDay()] + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
}

exports.dedupe = function(loadFunc) {
  var pending = {};
  return function(uri) {
      if (pending[uri]) return pending[uri];
      return pending[uri] = loadFunc(uri)
        .then(result => {
          delete pending[uri];
          return result;
        });
  };
};

exports.cache = function(expire, loadFunc) {
	var cache = {};
	return function(uri) {
		if (cache[uri] && cache[uri].time + expire > new Date().getTime()) return Promise.resolve(cache[uri].data);
		return loadFunc(uri)
			.then(result => {
				cache[uri] = {data: result, time: new Date().getTime()};
				return result;
			});
	};
};
