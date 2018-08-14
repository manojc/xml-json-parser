const request = require("request");
const XmlStream = require('xml-stream');
const db = require("./db/db");
const files = require("./files");

let items = [];
let count = 0;
let stream = null;

function onData(item) {
    items.push(item);
    if (++count % 500 !== 0) {
        return;
    }
    stream.pause();
    console.log("XML-STREAM - ", count);
    db.insertRecords(items, (error, records) => {
        if (error) {
            console.error(error);
        }
        items = [];
        stream.resume();
    });    
}

function onEnd() {
    console.log("XML-STREAM parsing finished!");
    if (items && items.length) {
        db.insertRecords(items, (error, records) => {
            if (error) {
                console.error(error);
            }
        });
    }    
}

function onError() {
    console.log("XML-STREAM ERROR OCCURRED!");    
}

function initStream(fileUrl) {
    stream = new XmlStream(request.get(fileUrl), "utf-8");
    stream.on('endElement:listing', onData);
    stream.on("end", onEnd);
    stream.on("error", onError);    
}

function processFile(fileUrl) {
    db.upsertFile(fileUrl, (error) => {
        if (error) {
            console.log(error);
            return;
        }
        initStream(fileUrl);
    });
}

function init(error) {
    if (error) {
        console.log(error);
        return;
    }
    files.forEach(file => processFile(file));
}

db.connect("mongodb://localhost:27017/xml-stream-test", init);