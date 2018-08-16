const stream = require("stream");

const virtualNode = "__data__";

function buildTransform() {
    let previousChunk = null;
    const transformStream = new stream.Transform();
    transformStream._transform = function (data, encoding, callback) {
        const rootTag = !previousChunk ? `{ \n\t"${virtualNode}": [` : "";
        if (previousChunk) {
            this.push(previousChunk);
        }
        previousChunk = `${rootTag}${data.toString()}`;
        callback();
    }
    transformStream._flush = function (callback) {
        if (previousChunk) {
            this.push(`${previousChunk}\n]}`);
            previousChunk = null;
        }
        callback();
    }
    return transformStream;
}

module.exports = {
    transform: buildTransform(),
    virtualNode: virtualNode
}