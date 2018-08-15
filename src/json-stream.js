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

function init(error) {
    if (error) {
        console.log(error);
        return;
    }
    parser = jsonStream.parse(`${files.json[0].rootNode}.*`);
    reader = request.get(files.json[0].url);
    reader.pipe(parser).on("data", onData).on("end", () => console.log("processed count ", count));
}

function init1(limit, skip) {
    //     if (!limit && ! skip) {
    //         const initialString = 
    //  `{
    //   "data": [`;
    //         fs.appendFileSync(`${__dirname}/data.json`, initialString);
    //     }
    //     limit = limit || 500;
    //     skip = skip || 0;
    //     db.dumpRecordsInFile("5b72c5385bd10129fbda2817", limit, skip, (err, docs) => {
    //         if (err) {
    //             throw err;
    //         }
    //         docs = docs || [];
    //         docs.forEach((doc, index, array) => {
    //             fs.appendFileSync(`${__dirname}/data.json`, JSON.stringify(doc.toObject(), null, 2));
    //             if (index < array.length - 1) {
    //                 fs.appendFileSync(`${__dirname}/data.json`, ",");                
    //             }
    //         });
    //         count += docs.length;
    //         console.log("total dumped records ", count);
    //         if (docs.length >= limit) {
    //             fs.appendFileSync(`${__dirname}/data.json`, ",");
    //             init(limit, skip + limit);
    //         } else {
    //             fs.appendFileSync(`${__dirname}/data.json`, "\n]}");
    //         }
    //     });
}

db.connect("mongodb://localhost:27017/xml-flow-test", init);