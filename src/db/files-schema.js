const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
    url: {
        type: mongoose.Schema.Types.String,
        required: [true, "file url is required!"]
    }
}, { timestamps: true });

module.exports = {
    FileSchema: FileSchema,
    fileCollection: mongoose.model("files", FileSchema, "files")
};