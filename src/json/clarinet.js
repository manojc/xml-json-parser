const request = require("request");
const clarinet = require("clarinet");
const files = require("../files");

const streamer = clarinet.createStream();

streamer.onkey = function(key, asd, qwe) {
    debugger;
}

streamer.onvalue = function(value, asd, qwe) {
    debugger;
}

request.get(files.json[0].url).pipe(streamer);