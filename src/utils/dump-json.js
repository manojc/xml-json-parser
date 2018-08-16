const Transform = require("stream").Transform;
const db = require("../db/db");

const bucketSize = 500;
let records = [];

function _transform(data, encoding, callback) {
    records = records || [];
    records.push(data);
    if (records && records.length % bucketSize === 0) {
        db.insertRecords(records, (error, docs) => {
            if (error) {
                throw error;
            }
            records = [];
            callback();
        });
    } else {
        callback();
    }
}

function _flush(callback) {
    if (records && records.length) {
        db.insertRecords(records, (error, docs) => {
            if (error) {
                throw error;
            }
            records = [];
            callback();
        });
    } else {
        callback();
    }
}

function _buildTransform() {
    return new Transform({ transform: _transform, flush: _flush });
}

module.exports = _buildTransform();