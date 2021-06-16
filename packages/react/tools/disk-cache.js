const jetpack = require('fs-jetpack');
const through2 = require('through2');

const cachePath = './.cache/data.json';
let cacheJSON = null;

const ensureCacheJsonLoaded = () => {
  if (!cacheJSON) {
    if (!jetpack.exists(cachePath)) {
      cacheJSON = {};
    } else {
      cacheJSON = jetpack.read(cachePath, 'json');
    }
  }
}

const getCacheItem = (key) => {
  ensureCacheJsonLoaded();

  let cacheItem = cacheJSON[key];
  return cacheItem || null;
}

const saveCacheItem = (key, data) => {
  ensureCacheJsonLoaded();

  cacheJSON[key] = data;
  jetpack.write(cachePath, cacheJSON);
  return data;
}

const cacheFiles = (opts, handler) => {
  const _opts = typeof opts === 'string'
    ? { key: opts, cache: true }
    : opts;
  return through2.obj(async function (file, encoding, next) {
    const cacheKey = _opts.key + '$$' + file.path;
    const cacheItem = getCacheItem(cacheKey);
    const parent = this;

    const useCache = _opts.cache
      && (cacheItem && cacheItem.input === file.contents.toString());

    if (useCache) {
      file.path = cacheItem.path;
      file.contents = Buffer.from(cacheItem.output);
      parent.push(file);
      next();
    } else {
      const input = file.contents.toString();
      await handler(file, encoding);
      saveCacheItem(cacheKey, {
        path: file.path,
        input,
        output: file.contents.toString()
      });
      file.contents = Buffer.from(file.contents);
      this.push(file);
      next();
    }
  });
}

module.exports = { cacheFiles }
