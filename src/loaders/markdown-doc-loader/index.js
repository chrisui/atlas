const MarkdownIt = require('markdown-it');
const MdAnchor = require('markdown-it-anchor');
const MdEmoji = require('markdown-it-emoji');
const MdReplaceLink = require('markdown-it-replace-link');
const frontMatter = require('front-matter');
const path = require('path');
const isEmpty = require('lodash/isEmpty');

module.exports = function markdownLoader(source) {
  // track anchors discovered in file
  const anchors = [];

  const {
    body,
    attributes,
  } = frontMatter(source);

  const md = require('markdown-it')({
    html: true,
    linkify: true,
    typographer: true,
    highlight: (str, lang) => str, // TODO: Replace with highlight.js or other
    // This replaceLink is defined by the markdown-it-replace-link plugin
    // Really it should allow us to pass as an option specifically for that
    // plugin usage but instead it makes us add a global option /shrug
    replaceLink: link => {
      // TODO: This normalisation feels like a big duplication of what happens in the resolve stage, what to do?
      const normalisedLink = path
        .resolve(this.context, link) // resolve relative linking
        .replace(this.options.context, '') // remove absolute part of path
        .replace(/\.(md|js|html)$/, '') // remove extensions from doc paths
        .split('/') // break out into parts
        .filter(part => !isEmpty(part)) // ignore empty path parts
        .filter(part => part !== 'docs') // docs portion of paths are stripped
        .filter(part => part !== 'README.md') // filter README part's since they're indexes
        .join('/'); // stitch parts back into a link

      if (/\/\_/.test(normalisedLink))
        throw new Error('Cant link to private files/directories!');

      // TODO: Fix absolute urls

      return normalisedLink;
    },
  })
    // Aim is to keep as close to github markdown implementation as possible.
    // Anything extra should be for metadata (eg. front-matter usage)
    .use(MdReplaceLink)
    .use(MdEmoji, {})
    .use(MdAnchor, {
      permalink: true,
      callback: (token, anchor) => anchors.push(anchor),
    });

  const html = md.render(body);

  // store data for doc loader to pick up
  this.input = {anchors, attributes, type: 'md'};

  return html;
};
