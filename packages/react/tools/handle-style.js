const NpmImportPlugin = require('less-plugin-npm-import');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const postcss = require('postcss');
const less = require('less');
const sass = require('sass');
const { replacer, presets } = require('postcss-rename-selector');

/**
 * 
 * @description From ant-tools (https://github.com/ant-design/antd-tools/blob/master/lib/transformLess.js)
 */
async function transformLess(filepath, data, options = {}) {
  const resolvedLessFile = filepath;

  // Do less compile
  const lessOpts = {
    filename: resolvedLessFile,
    plugins: [
      new NpmImportPlugin({ prefix: '~' }),
    ],
    javascriptEnabled: true,
    ...options,
  };

  let { css } = await less.render(data, lessOpts)
  css = await scopedAnt(css)
  return css;
}

async function transformScss(filepath, data) {
  const resolvedScssFile = filepath;

  const { css } = await new Promise((resolve, reject) => {
    sass.render({
      file: resolvedScssFile,
      data,
    }, function (err, res) {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  })
  return css;
}


async function scopedAnt(css) {
  // presets.antdReplacer see https://juejin.cn/post/6844904116288749581#heading-4
  const result = await postcss([autoprefixer, replacer(presets.antdReplacer)]).process(css, { from: undefined })
  return result.css;
}

async function minify(css) {
  const result = await postcss([
    cssnano({ preset: 'default' })
  ]).process(css, { from: undefined });
  return result.css;
}

module.exports = {
  transformLess,
  transformScss,
  scopedAnt,
  minify,
}