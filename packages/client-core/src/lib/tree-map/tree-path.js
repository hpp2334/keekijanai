"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTreePathString = exports.validateTreePathString = void 0;
const validateTreePathString = (treepath) => {
    const invalid = treepath.indexOf('//') >= 0 || treepath === '' || treepath === '/' || treepath.endsWith('\\');
    return !invalid;
};
exports.validateTreePathString = validateTreePathString;
const parseTreePathString = (treepath) => {
    const valid = exports.validateTreePathString(treepath);
    if (!valid) {
        throw Error(`"${treepath}" is invalid.`);
    }
    let ed = treepath.length;
    ed = treepath[ed - 1] === '/' ? ed - 1 : ed;
    let be = treepath[0] === '/' ? 1 : 0;
    let escape = 0;
    let ch = '';
    let item = '';
    const list = [];
    while (be < ed) {
        while (be < ed) {
            ch = treepath[be];
            if (escape === 0 && ch === '\\') {
                escape = 2;
            }
            if (!escape && ch === '/') {
                break;
            }
            if (escape < 2) {
                item += ch;
            }
            be++;
            escape = escape === 0 ? 0 : escape - 1;
        }
        list.push(item);
        item = '';
        be++;
    }
    return list;
};
exports.parseTreePathString = parseTreePathString;
//# sourceMappingURL=tree-path.js.map