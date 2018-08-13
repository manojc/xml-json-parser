var request = require("request");
var XmlFlow = require('xml-flow');
var db = require("./db");

let items = [];
let count = 0;

function init(error) {
    if (error) {
        console.log(error);
        return;
    }

    var flow = new XmlFlow(request.get("http://192.168.1.135:8080/nj_jivox.xml"), "utf-8");

    flow.on('tag:listing', function (item) {
        items.push(item);
        if (++count % 500 !== 0) {
            return;
        }
        const dbItems = [...items];
        items = [];
        console.log("XML-FLOW - ", count);
        db.insert(dbItems, (error, records) => {
            if (error) {
                console.error(error);
            }
        });
    });

    flow.on("end", () => {
        console.log("XML-FLOW parsing finished!");
        if (!items || !items.length) {
            return;
        }
        db.insert(items, (error, records) => {
            if (error) {
                console.error(error);
            }
        });
    });

    flow.on("error", () => {
        console.log("XML-FLOW ERROR OCCURRED!");
    });
}

db.connect("mongodb://localhost:27017/xml-flow-test", init);