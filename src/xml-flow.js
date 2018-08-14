var request = require("request");
var XmlFlow = require('xml-flow');
var db = require("./db/db");
const files = require("./files");

let items = [];
let count = 0;
let flow = null;

function onData(item) {
    items.push(item);
    if (++count % 500 !== 0) {
        return;
    }
    const dbItems = [...items];
    items = [];
    console.log("XML-FLOW - ", count);
    db.insertRecords(dbItems, (error, records) => {
        if (error) {
            console.error(error);
        }
    });
}

function onEnd() {
    console.log("XML-FLOW parsing finished!");
    if (!items || !items.length) {
        return;
    }
    db.insertRecords(items, (error, records) => {
        if (error) {
            console.error(error);
        }
    });
}

function onError() {
    console.log("XML-FLOW ERROR OCCURRED!"); 
}

function initStream(fileUrl) {
    flow = new XmlFlow(request.get(fileUrl));
    flow.on('tag:listing', onData);
    flow.on("end", onEnd);
    flow.on("error", onError);    
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

db.connect("mongodb://localhost:27017/xml-flow-test", init);