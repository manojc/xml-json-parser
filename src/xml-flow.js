var request = require("request");
var xmlFlow = require('xml-flow');
var db = require("./db/db");
const files = require("./files");

let items = [];
let testCount = 0;
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
    ++testCount;
    items.push(item);
    if (items.length % 500 !== 0) {
        return;
    }
    flow.pause();
    count += items.length;
    let dbitems = [...items];
    items = [];
    db.insertRecords(dbitems, (error, records) => {
        if (error) {
            console.error(error);
        }
        console.log("XML-FLOW - ", count);
        flow.resume();
    });
}

function onEnd() {
    console.log("XML-FLOW parsing finished!");
    if (!items || !items.length) {
        count += items.length;
        console.log("final counts are - ", count, testCount);
        return processNextFile();
    }
    db.insertRecords(items, (error, records) => {
        if (error) {
            console.error(error);
        }
        count += items.length;
        console.log("final counts are - ", count, testCount);
        processNextFile();
    });
}

function onError() {
    console.log("XML-FLOW ERROR OCCURRED!");
}

function initStream(fileObj) {
    flow = xmlFlow(request.get(fileObj.url), { cdataAsText: true, strict: true });
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