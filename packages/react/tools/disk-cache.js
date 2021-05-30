const jetpack = require('fs-jetpack');

const cachePath = './.cache/data.json';
let cacheJSON = null;

const transformData = (data) => {
  return typeof data === 'string' ? data : data.toString();
}

const ensureCacheJsonLoaded = () => {
  if (!cacheJSON) {
    if (!jetpack.exists(cachePath)) {
      cacheJSON = {};
    } else {
      cacheJSON = jetpack.read(cachePath, 'json');
    }
  }
}

const getCacheItem = (key, inputData) => {
  let cacheItem = cacheJSON[key];
  inputData = transformData(inputData);
  if (cacheItem && cacheItem.input === inputData) {
    return cacheItem;
  } else {
    cacheItem = cacheJSON[key] = {
      match: false,
      input: inputData,
    };
  }
  return cacheItem;
}

const saveCacheItem = (key, data) => {
  let cacheItem = cacheJSON[key];
  cacheItem.data = transformData(data);
  cacheItem.match = true;
  cacheJSON[key] = cacheItem;
  jetpack.write(cachePath, cacheJSON);
  return cacheItem;
}

module.exports = {
  ensureCacheJsonLoaded,
  getCacheItem,
  saveCacheItem,
}
