const mongoose = require("mongoose");
const previewSchema = require("./schema");

function connect(url, callback) {
    mongoose
        .connect(url).then(() => {
            if (callback && typeof callback === "function") {
                callback();
            }
        })
        .catch((error) => {
            if (callback && typeof callback === "function") {
                callback(error);
            }
        });
}

function insert(records, callback) {
    if (!records || !records.length) {
        if (callback && typeof callback === "function") {
            callback();
        }
        return;
    }

    const previews = records.reduce((previews, record, index) => {
        previews.push({
            preview: record
        });
        return previews;
    }, []);
    
    previewSchema.previewCollection.insertMany(previews, (error, docs) => {
        if (error) {
            if (callback && typeof callback === "function") {
                callback(error);
            }
            return;
        }
        return callback(docs);
    });

}

module.exports = { 
    connect: connect, 
    insert: insert 
};