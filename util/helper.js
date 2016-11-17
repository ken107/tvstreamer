
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
