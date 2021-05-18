const { readFileSync } = require('fs');
const path = require('path');
const NpmImportPlugin = require('less-plugin-npm-import');
const autoprefixer = require('autoprefixer');
const postcss = require('postcss');
const less = require('less');
const through2 = require('through2');
const gulp = require('gulp');
const { replacer, presets } = require('postcss-rename-selector');

/**
 * 
 * @description From ant-tools (https://github.com/ant-design/antd-tools/blob/master/lib/transformLess.js)
 */
function transformLess(lessFile, options = {}) {
  const resolvedLessFile = lessFile;

  let data = readFileSync(resolvedLessFile, 'utf-8');
  data = data.replace(/^\uFEFF/, '');

  // Do less compile
  const lessOpts = {
    paths: [path.dirname(resolvedLessFile)],
    filename: resolvedLessFile,
    plugins: [
      new NpmImportPlugin({ prefix: '~' }),
    ],
    javascriptEnabled: true,
    ...options,
  };

  // presets.antdReplacer see https://juejin.cn/post/6844904116288749581#heading-4

  return less
    .render(data, lessOpts)
    .then(result => postcss([autoprefixer, replacer(presets.antdReplacer)]).process(result.css, { from: undefined }))
    .then(r => r.css);
}

module.exports = {
  transformLess
}