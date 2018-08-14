const mongoose = require("mongoose");

const PreviewSchema = new mongoose.Schema({
    preview: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, "preview object is required!"]
    }
}, { timestamps: true });

module.exports = { 
    PreviewSchema: PreviewSchema, 
    previewCollection: mongoose.model("previews", PreviewSchema, "previews") 
};