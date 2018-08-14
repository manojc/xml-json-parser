var request = require("request");
var XmlFlow = require('xml-flow');
var db = require("./db/db");
const files = require("./files");

let items = [];
let count = 0;
let fileIndex = -1;
let flow = null;

function processNextFile() {
    count = 0;
    ++fileIndex;
    if (files && files[fileIndex] && typeof files[fileIndex] === "object") {
        if (!!files[fileIndex].url && !!files[fileIndex].rootNode) {
            console.log(`\n\n\nprocessing file ${files[fileIndex].url}\n\n\n`);
            processFile(files[fileIndex]);            
        }
    }
}

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
        return processNextFile();
    }
    db.insertRecords(items, (error, records) => {
        if (error) {
            console.error(error);
        }
        processNextFile();
    });
}

function onError() {
    console.log("XML-FLOW ERROR OCCURRED!");
}

function initStream(fileObj) {
    flow = new XmlFlow(request.get(fileObj.url), { cdataAsText: true, strict: true });
    flow.on(`tag:${fileObj.rootNode}`, onData);
    flow.on("end", onEnd);
    flow.on("error", onError);
}

function processFile(fileObj) {
    db.upsertFile(fileObj.url, (error, fileId) => {
        if (error) {
            console.log(error);
            return;
        }
        initStream(fileObj);
    });
}

function init(error) {
    if (error) {
        console.log(error);
        return;
    }
    processNextFile();
}

db.connect("mongodb://localhost:27017/xml-flow-test", init);