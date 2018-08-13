var request = require("request");
var XmlFlow = require('xml-flow');

let count = 0;
var flow = new XmlFlow(request.get("http://192.168.1.135:8080/nj_jivox.xml"), "utf-8");

flow.on('tag:listing', function (listing) {
    if (++count % 500 === 0) {
        console.log("XML-FLOW - ", count);
    }
});

flow.on("end", () => {
    console.log("XML-FLOW parsing finished!");
});

flow.on("error", () => {
    console.log("XML-FLOW ERROR OCCURRED!");
});