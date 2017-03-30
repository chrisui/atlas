const loaderUtils = require('loader-utils');
const fs = require('fs');

module.exports = function htmlDocLoader(source) {
  const options = loaderUtils.getOptions(this) || {};
  this.cacheable(true);

  if (options.meta) {
    try {
      const meta = require(`${this.resourcePath}.meta.json`);
      // meta files are just json!
      return meta;
    } catch (err) {
      // meta files are just json!
      return {anchors: [], attributes: {}};
    }
  }

  // non meta files are js!
  return source;
};
