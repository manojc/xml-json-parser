const fs = require("fs");
const request = require("request");
const jsonStream = require('JSONStream');
const db = require("./db/db");
const files = require("./files");

let count = 0;
let parser = null;
let reader = null;

function onData(data) {
    if (++count % 500 === 0) {
        console.log("processed count ", count);
    }
}

function onEnd() {
    console.log("processed count ", count);
}

function init(error) {
    if (error) {
        console.log(error);
        return;
    }
    parser = jsonStream.parse(`${files.json[0].rootNode}.*`);
    reader = request.get(files.json[0].url);
    reader.pipe(parser).on("data", onData).on("end", onEnd);
}

db.connect("mongodb://localhost:27017/xml-flow-test", init);