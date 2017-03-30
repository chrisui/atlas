module.exports = function htmlReactLoader(source) {
  this.cacheable(true);
  // TODO: Is there a better way we can utilise the html-loader parsing between markdown loading and react components?
  //       Ie. could html-loader just dump html rather than wrap as js module (with some ?raw option)
  // TODO: Better to convert the html to jsx as well? Use htmltojsx library
  const htmlDefinition = source.replace(/^module\.exports/, 'const html');
  return `
  import React from 'react';
  ${htmlDefinition}
  export default function Component(props) {
    return (
      <div {...props} dangerouslySetInnerHTML={{__html: html}}></div>
    );
  }
  `;
};
