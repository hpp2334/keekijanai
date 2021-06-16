const path = require('path');

const slash = (s) => {
  return s.split(path.sep).join(path.posix.sep)
}

/**
 * 
 * @param {string | string[]} moduleName 
 * @param {Record<string, string>} moduleFiles
 * @param {boolean?} recursive deafult is false
 * @returns {Array<typeof module.exports>} depend module
 */
function getDependencyModuleFiles(moduleName, buildFiles, recursive) {
  const moduleNames = typeof moduleName === 'string' ? [moduleName] : moduleName;
  const result = new Set();
  moduleNames.forEach(moduleName => {
    require(moduleName);

    var modulePath = require.resolve(moduleName);
    var rootModule = require.cache[modulePath];
    const REG_ANTD_IMPORT = new RegExp(`import {([^}]+)} from "${moduleName}(?:/[^"]+)?"`);
  
    const set = new Set();
    for (const buildFilePath in buildFiles) {
      // const REG_ANTD_IMPORT = new RegExp(`import {([^}]+)} from "${moduleName}(?:/[^"]+)?"`);
      const file = buildFiles[buildFilePath];
      const [_, res] = REG_ANTD_IMPORT.exec(file) || [];
      if (res) {
        const modules = res.split(',').map(s => s.trim());
        modules
          .map(moduleExpr => moduleExpr.replace(/(\w+)\s+as\s+\w+/, (_, moduleName) => moduleName))
          .forEach(m => set.add(m))
      }
    }
    var mapExportsToModule = new Map();
    const list = [
      ...rootModule.children.filter(v => v.exports).map(v => [v.exports, v]),
      ...rootModule.children.filter(v => v.exports && v.exports.default).map(v => [v.exports.default, v])
    ];
    list.forEach(v => mapExportsToModule.set(v[0], v[1]));

    let vis = new Set();
    for (const moduleName of set) {
      const exports = rootModule.exports[moduleName]
      let module = mapExportsToModule.get(exports);

      // if recursive, use bfs to search indirect dependency
      if (recursive) {
        const queue = [module];
        while (queue.length > 0) {
          module = queue.pop();
          vis.add(module.id)
          result.add(module);
          for (const nextModule of module.children) {
            if (!vis.has(nextModule.id)) {
              queue.push(nextModule);
            }
          }
        }
      }
    }
  })
  return [...result];
}

module.exports = {
  getDependencyModuleFiles,
}