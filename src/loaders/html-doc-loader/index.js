const loaderUtils = require('loader-utils');
const frontMatter = require('html-frontmatter');

module.exports = function htmlDocLoader(source) {
  const options = loaderUtils.getOptions(this) || {};
  const attributes = frontMatter(source);
  this.cacheable(true);

  if (options.meta) {
    // TODO: Pull anchors from html
    const meta = {anchors: [], attributes};
    // meta files are just json!
    return meta;
  }

  // non meta files are html!
  return source;
};
