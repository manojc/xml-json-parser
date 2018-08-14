var request = require("request");
var XmlStream = require('xml-stream');
var db = require("./db");

let items = [];
let count = 0;
const fileUrl = "http://192.168.1.135:8080/nj_jivox.xml";

function init(error) {
    if (error) {
        console.log(error);
        return;
    }

    db.upsertFile(fileUrl, (error) => {
        if (error) {
            console.log(error);
            return;
        }

        var stream = new XmlStream(request.get(fileUrl), "utf-8");

        stream.on('endElement:listing', function (item) {
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
        });

        stream.on("end", () => {
            console.log("XML-STREAM parsing finished!");
            if (items && items.length) {
                db.insertRecords(items, (error, records) => {
                    if (error) {
                        console.error(error);
                    }
                });
            }
        });

        stream.on("error", () => {
            console.log("XML-STREAM ERROR OCCURRED!");
        });
    });
}

db.connect("mongodb://localhost:27017/xml-stream-test", init);