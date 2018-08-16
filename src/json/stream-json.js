const request = require("request");
const StreamArray = require('stream-json/streamers/StreamArray');
const db = require("../db/db");
const files = require("../files");

let count = 0;
let parser = null;
let reader = null;

function onData(data) {
    console.log(data);    
}

function onEnd() {
    console.log(`Found ${count} objects.`);
}

function init(error) {
    if (error) {
        throw error;
        return;
    }
    reader = request.get(files.json[0].url);
    reader.on('data', (data) => { 
        debugger;
    });
    // reader.pipe(StreamArray.withParser()).on('data', onData);;
}

db.connect("mongodb://localhost:27017/xml-flow-test", init);