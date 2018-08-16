const request = require("request");
const jsonStream = require('JSONStream');
const db = require("../db/db");
const files = require("../files");
const jsonTransform = require("../utils/transform-json");

let count = 0;
let parser = null;
let reader = null;

function onData(data) {
    if (++count % 500 === 0) {
        console.log("processed count ", count);
    }
}

function onEnd() {
    console.log("processed count ", count, "\nfinished!!");
}

function init(error) {
    if (error) {
        console.log(error);
        return;
    }
    parser = jsonStream.parse(`${jsonTransform.virtualNode}..${files.json[0].rootNode}.*`);
    reader = request.get(files.json[0].url);
    // reader.pipe(parser).on("data", onData).on("end", onEnd);
    reader.pipe(jsonTransform.transform).pipe(parser).on("data", onData).on("end", onEnd);
}

db.connect("mongodb://localhost:27017/xml-flow-test", init);