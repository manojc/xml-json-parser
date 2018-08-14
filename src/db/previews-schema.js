const mongoose = require("mongoose");

const PreviewSchema = new mongoose.Schema({
    preview: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, "preview object is required!"]
    }
}, { timestamps: true });

function createCollection(suffix) {
    if (!suffix || typeof suffix !== "string" || !suffix.trim()) {
        console.error("preview collection prefix is required!");
    }

    return mongoose.model("previews", PreviewSchema, `previews_${suffix}`);
}

module.exports = {
    PreviewSchema: PreviewSchema,
    previewCollection: createCollection
};