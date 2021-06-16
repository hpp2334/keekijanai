const path = require('path');

Object.defineProperty(String.prototype, 'slash', {
  get: function () {
    return this.split(path.sep).join(path.posix.sep)
  }
})

Object.defineProperty(String.prototype, 'relative', {
  get: function () {
    return path.posix.relative(process.cwd().slash, this.slash);
  }
})

Object.defineProperty(String.prototype, 'dirname', {
  get: function () {
    return path.posix.dirname(this.slash);
  }
})
