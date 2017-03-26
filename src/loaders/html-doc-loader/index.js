const frontMatter = require('html-frontmatter');

module.exports = function htmlDocLoader(source) {
  const attributes = frontMatter(source);

  // store data for doc loader to pick up
  // TODO: Pull anchors from html
  this.input = {anchors: [], attributes, type: 'html'};

  return source;
};
