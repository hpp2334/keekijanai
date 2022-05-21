const { processEntireRequest: _process } = require("./index.node");

function promisify(handler) {
  return function (...args) {
    let _res = null,
      _rej = null;
    const ret = new Promise((res, rej) => {
      _res = res;
      _rej = rej;
    });

    try {
      handler(...args, function (err, payload) {
        if (err) {
          _rej(err);
        } else {
          _res(payload);
        }
      });
    } catch (err) {
      _rej(err);
    }

    return ret;
  };
}

module.exports.processEntireRequest = promisify(_process);
