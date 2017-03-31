const capitalize = require('capitalize');
const humanize = require('humanize-string');

module.exports = function formatName(name) {
  return capitalize.words(humanize(name));
};
