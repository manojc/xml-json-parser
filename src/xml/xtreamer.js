const stream = require("stream");
const request = require("request");
const xtreamer = require('xtreamer');
const xmlParser = require('xml-js');
const db = require("../db/db");

class XtreamerClient extends stream.Writable {

    constructor() {
        super();
        this._count = 0;
        this._nodes = [];
    }

    _write(chunk, encoding, next) {
        this._nodes.push(this._parse(chunk.toString()));
        if (this._nodes.length % 200 !== 0) {
            return next();
        }
        db.insertRecords(this._nodes, (error, records) => {
            this._nodes = [];
            if (error) {
                this._destroy(error);
            }
            this._count += records.length;
            console.log(`records processed - ${this._count}`);
            return next();
        });
    }

    _parse(xmlText) {
        try {
            xmlText = xmlText.toString().replace("\ufeff", "");
            const options = {
                compact: true,
                trim: true,
                ignoreComment: true,
                ignoreDoctype: true,
                cdataFn: (value, parentElement) => { return this._modifyValue(value, parentElement, "cdata") },
                textFn: (value, parentElement) => { return this._modifyValue(value, parentElement, "text") },
            };
            return xmlParser.xml2js(xmlText, options);
        } catch (error) {
            this.destroy(error);
        }
    }

    _modifyValue(value, parentElement, type) {
        if (!parentElement._parent) {
            return value;
        }
        let keys = Object.keys(parentElement._parent);
        if (!keys || !keys.length) {
            return value;
        }
        let parentKey;
        let obj = {};
        // get parent key, it is the last key of parent object
        switch (type) {
            case "cdata":
                parentKey = `${keys[keys.length - 1]}_cdata`;
                break;
            case "text":
                parentKey = `${keys[keys.length - 1]}_text`;
                break;
            default:
                break;
        }
        obj[parentKey] = value;
        return obj;
    }
}

async function init(error) {
    if (error) {
        console.error(error);
        return;
    }

    const url = "http://aiweb.cs.washington.edu/research/projects/xmltk/xmldata/data/pir/psd7003.xml";

    await db.upsertFile(url);

    // input readable stream with event handlers
    const readStream = request.get(url);

    // xtreamer transform stream with custom event handler
    const xtreamerTransform = xtreamer("ProteinEntry")
        .on("error", (error) => console.error(error));

    // input | transform
    readStream.pipe(xtreamerTransform).pipe(new XtreamerClient());

}

db.connect("mongodb://localhost:27017/xtreamer-test", init);