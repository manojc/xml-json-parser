const Transform = require("stream").Transform;

const virtualNode = "__virtual_data_node__";
let previousChunk = null;

function _transform(data, encoding, callback) {
    const rootTag = !previousChunk ? `{ \n\t"${virtualNode}": [` : "";
    if (previousChunk) {
        this.push(previousChunk);
    }
    previousChunk = `${rootTag}${data.toString()}`;
    callback();
}

function _flush(callback) {
    if (previousChunk) {
        this.push(`${previousChunk}\n]}`);
        previousChunk = null;
    }
    callback();
}

function _buildTransform() {
    previousChunk = null;
    return new Transform({ transform: _transform, flush: _flush });
}

module.exports = {
    transform: _buildTransform(),
    virtualNode: virtualNode
};