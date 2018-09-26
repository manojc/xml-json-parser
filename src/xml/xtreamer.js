const { Writable } = require("stream")
const request = require("request");
const xtreamer = require('xtreamer');
const xmlParser = require('xml-js');
const db = require("../db/db");

let _nodes = [];
let _count = 0;

class XtreamerClient extends Writable {

    constructor() {
        super();
        this._count = 0;
        this._count1 = 0;
        this._nodes = [];
    }

    async _write(chunk, encoding, next) {
        this._nodes.push(this._parse(chunk.toString()));
        if (this._nodes.length % 1000 !== 0) {
            return next();
        }
        try {
            const records = await db.insertRecords(this._nodes);
            this._nodes = [];
            this._count += records.length;
            console.log(`records processed - ${this._count}`);
            return next();
        } catch (error) {
            this.destroy(error);
        }
    }

    _final(callback) {
        console.log("final blow!");
        callback();
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

function _onData(node) {
    _nodes.push(_parse(node));
    _nodes.length % 1000 === 0 && _dump();
}

function _onEnd() {
    _nodes && _nodes.length && _dump();
}

async function _dump() {
    try {
        const records = await db.insertRecords(_nodes);
        _nodes = [];
        _count += records.length;
        console.log(`records processed - ${_count}`);
    } catch (error) {
        console.error(error);
    }
}

function _parse(xmlText) {
    try {
        xmlText = xmlText.toString().replace("\ufeff", "");
        const options = {
            compact: true,
            trim: true,
            ignoreComment: true,
            ignoreDoctype: true,
            cdataFn: (value, parentElement) => { return _modifyValue(value, parentElement, "cdata") },
            textFn: (value, parentElement) => { return _modifyValue(value, parentElement, "text") },
        };
        return xmlParser.xml2js(xmlText, options);
    } catch (error) {
        console.error(error);
    }
}

function _modifyValue(value, parentElement, type) {
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

async function init(error) {
    if (error) {
        console.error(error);
        return;
    }

    const node = "dataset";
    const url = "https://raw.githubusercontent.com/manojc/xtagger/gh-pages/demo/23mb.xml";
    // const node = "ProteinEntry";
    // const url = "http://aiweb.cs.washington.edu/research/projects/xmltk/xmldata/data/pir/psd7003.xml";

    await db.upsertFile(url);

    // input readable stream with event handlers
    const readStream = request.get(url);

    // xtreamer transform stream with custom event handler
    const xtreamerTransform = xtreamer(node)
        // .on("data", _onData)
        // .on("end", _onEnd)
        .on("error", (error) => console.error(error));

    // input | transform
    readStream.pipe(xtreamerTransform).pipe(new XtreamerClient());

    // readStream.pipe(xtreamerTransform)

}

db.connect("mongodb://localhost:27017/xtreamer-test", init);