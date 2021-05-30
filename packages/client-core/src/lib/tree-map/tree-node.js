"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTreeNode = exports.TreeNode = void 0;
const tree_path_1 = require("./tree-path");
const UNDEFINED_OBJECT = {};
class TreeNode {
    constructor(value) {
        this._value = UNDEFINED_OBJECT;
        this._parent = null;
        this._selfKeyInParent = null;
        this._child = null;
        this._value = value;
    }
    get parent() {
        return this._parent;
    }
    get children() {
        return this._child;
    }
    hasValue() {
        return this._value !== UNDEFINED_OBJECT;
    }
    getValue() {
        return this._value === UNDEFINED_OBJECT ? undefined : this._value;
    }
    setValue(nextValue) {
        this._value = nextValue;
    }
    /** Remove value in this tree node */
    deleteValue() {
        this._value = UNDEFINED_OBJECT;
    }
    /**
     * Remove node in sub tree. NOTICE: this method only delete value for this node, and unlink between this node and its parent and children.
     * @param inclusive include itself or not
     */
    removeAll(inclusive) {
        var _a, _b;
        if (!this._selfKeyInParent) {
            throw Error('_selfKeyInParent is null. It\'s a bug');
        }
        if (inclusive) {
            (_b = (_a = this._parent) === null || _a === void 0 ? void 0 : _a._child) === null || _b === void 0 ? void 0 : _b.delete(this._selfKeyInParent);
            this.deleteValue();
        }
        this._child = null;
    }
    getChild(key, autoCreate) {
        var _a;
        let childMap = this._child = (_a = this._child) !== null && _a !== void 0 ? _a : new Map();
        let childNode = undefined;
        if (childMap.has(key)) {
            childNode = childMap.get(key);
        }
        else if (!autoCreate) {
            return childNode;
        }
        else {
            childNode = createTreeNode();
            childNode._parent = this;
            childNode._selfKeyInParent = key;
            childMap.set(key, childNode);
        }
        return childNode;
    }
    access(treepath, autoCreate) {
        const node = this.visit(treepath, undefined, false, autoCreate);
        return node;
    }
    visit(treepath, onVisit, inclusive, autoCreate) {
        let root = this;
        if (inclusive) {
            onVisit === null || onVisit === void 0 ? void 0 : onVisit(root);
        }
        const treepaths = typeof treepath === 'string' ? tree_path_1.parseTreePathString(treepath) : treepath;
        let n = treepaths.length;
        for (let i = 0; i < n; i++) {
            let p = treepaths[i];
            const child = autoCreate
                ? root.getChild(p, true)
                : root.getChild(p, false);
            if (child) {
                onVisit === null || onVisit === void 0 ? void 0 : onVisit(child);
                root = child;
            }
            else {
                return undefined;
            }
        }
        return root;
    }
}
exports.TreeNode = TreeNode;
function createTreeNode(value = UNDEFINED_OBJECT) {
    return new TreeNode(value);
}
exports.createTreeNode = createTreeNode;
//# sourceMappingURL=tree-node.js.map