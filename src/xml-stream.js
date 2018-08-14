var request = require("request");
var XmlStream = require('xml-stream');
var db = require("./db/db");

let items = [];
let count = 0;
let stream = null;
const fileUrl = "http://192.168.1.135:8080/nj_jivox.xml";

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

function initStream() {
    stream = new XmlStream(request.get(fileUrl), "utf-8");
    stream.on('endElement:listing', onData);
    stream.on("end", onEnd);
    stream.on("error", onError);    
}

function processFile() {
    db.upsertFile(fileUrl, (error) => {
        if (error) {
            console.log(error);
            return;
        }
        initStream();
    });
}

function init(error) {
    if (error) {
        console.log(error);
        return;
    }
    processFile();
}

db.connect("mongodb://localhost:27017/xml-stream-test", init);