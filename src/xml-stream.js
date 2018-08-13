var request = require("request");
var XmlStream = require('xml-stream');

let count = 0;
var stream = new XmlStream(request.get("http://192.168.1.135:8080/nj_jivox.xml"), "utf-8");

stream.on('endElement:listing', function (item) {
    if (++count % 500 === 0) {
        console.log("XML-STREAM - ", count);
    }
});

stream.on("end", () => {
    console.log("XML-STREAM parsing finished!");
});

stream.on("error", () => {
    console.log("XML-STREAM ERROR OCCURRED!");
});