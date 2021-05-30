"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeMap = void 0;
const tree_node_1 = require("./tree-node");
class TreeMap {
    constructor() {
        this._root = tree_node_1.createTreeNode();
    }
    get root() {
        return this._root;
    }
}
exports.TreeMap = TreeMap;
//# sourceMappingURL=tree-map.js.map