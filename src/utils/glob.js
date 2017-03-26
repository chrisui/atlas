const _glob = require('glob');

module.exports = function glob(pattern, options) {
  return new Promise((resolve, reject) => {
    _glob(pattern, options, (err, files) => {
      if (err) reject(err);
      else resolve(files);
    });
  });
};
