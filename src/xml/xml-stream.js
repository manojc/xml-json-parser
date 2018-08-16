const request = require("request");
const XmlStream = require('xml-stream');
const db = require("../db/db");
const files = require("../files");

let items = [];
let count = 0;
let testCount = 0;
let fileIndex = -1;
let stream = null;

function processNextFile() {
    count = 0;
    ++fileIndex;
    if (files && files.xml && files.xml[fileIndex] && typeof files.xml[fileIndex] === "object") {
        if (!!files.xml[fileIndex].url && !!files.xml[fileIndex].rootNode) {
            console.log(`\n\n\nprocessing file ${files.xml[fileIndex].url}\n\n\n`);
            processFile(files.xml[fileIndex]);
        }
    }
}

function onData(item) {
    ++testCount;
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
    if (!items || !items.length) {
        count += items.length;
        console.log("final counts are - ", count, testCount);
        return processNextFile();
    }
    if (items && items.length) {
        db.insertRecords(items, (error, records) => {
            if (error) {
                console.error(error);
            }
            count += items.length;
            console.log("final counts are - ", count, testCount);
            return processNextFile();
        });
    }
}

function onError() {
    console.log("XML-STREAM ERROR OCCURRED!");
}

function initStream(fileObj) {
    stream = new XmlStream(request.get(fileObj.url), "utf-8");
    stream.on(`endElement:${fileObj.rootNode}`, onData);
    stream.on("end", onEnd);
    stream.on("error", onError);
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

db.connect("mongodb://localhost:27017/xml-stream-test", init);