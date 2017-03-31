const glob = require('../../utils/glob');
const loaderUtils = require('loader-utils');
const flatten = require('lodash/flatten');
const zip = require('lodash/zip');
const uniq = require('lodash/uniq');

// TODO: This is a bit of a hacky use of loader. We would benefit from this resolution being a pre-webpack step however then do we lose incremental build/context watching capabilities?

function id(file) {
  return loaderUtils.getHashDigest(file, 'sha1', 'hex', 8);
}

function mapTree(tree, mapper) {
  const mappedChildren = tree.children.map(node => mapTree(tree, mapper));
  return mapper(Object.assign({}, tree, {children: mappedChildren}));
}

function squashTree(tree) {
  let node = tree;

  if (node.children.length === 1) {
    node.value = [node.value, node.children[0].value].join('/');
    node.squashed = true;
    node.page = node.children[0].page;
    node.children = node.children[0].children;
    node = squashTree(node); // recurse on self to keep flattening
  } else {
    node.children = node.children.map(squashTree);
  }

  return node;
}

function buildTree(paths) {
  const tree = {
    value: null,
    page: null,
    children: [],
  };

  paths.forEach(path => {
    let node = tree;
    path.path.forEach(part => {
      if (!node.children.find(n => n.value === part)) {
        node.children.push({
          value: part,
          page: null,
          children: [],
        });
      }
      node = node.children.find(n => n.value === part);
    });
    if (path.index) {
      node.children.push({
        value: 'INDEX',
        page: path,
        children: [],
      });
    } else {
      node.page = path;
    }
  });

  return tree;
}

async function enhancePath(path) {
  return new Promise((resolve, reject) => {
    if (path.type === 'doc') {
      this.loadModule(
        `!raw-loader!${path.ext}-doc-loader?meta!${path.file}`,
        (err, source, sm, module) => {
          if (err) {
            return reject(err);
          }
          resolve(
            Object.assign({}, path, {
              meta: JSON.parse(source.replace('module.exports = ', '')),
            })
          );
        }
      );
      return;
    }

    resolve(path);
  });
}

async function enhancePaths(paths) {
  return Promise.all(paths.map(enhancePath.bind(this)));
}

function genCode(_tree, _list) {
  const data = path => path ? JSON.stringify(path) : null;
  const load = path =>
    path ? `function load() { return import('${path.file}')}` : null;
  const id = path => path ? JSON.stringify(path.id) : null;
  const tree = node =>
    `{data: ${data(node.page)}, value: ${data(node.value)}, load: ${load(node.page)}, children: ${children(node)}}`;
  const children = node => `[\n${node.children.map(tree).join(',\n')}\n]`;
  const list = paths =>
    `[${paths
      .map(
        path => `{id: ${id(path)}, data: ${data(path)}, load: ${load(path)}}`
      )
      .join(',\n')}]`;

  return `// this is a generated file from atlas
    export const tree = ${tree(_tree)};
    export const list = ${list(_list)};
  `;
}

function docFileToPath(file) {
  const ext = file.split('.').pop();
  const path = file
    .replace(/\.[a-zA-Z]+$/, '') // ignore file extension in path
    .split('/') // get our path pieces
    .filter(part => part !== 'docs'); // normalise to exclude docs in path

  return {
    id: id(file),
    file,
    path,
    ext,
    type: 'doc',
  };
}

function readmeFileToPath(file) {
  const ext = file.split('.').pop();
  const path = file
    .replace(/\.[a-zA-Z]+$/, '') // ignore file extension in path
    .split('/') // get our path pieces
    .filter(part => part !== 'docs') // normalise to exclude docs in path
    .filter(part => part !== 'README'); // normalise to exclude README in path

  return {
    id: id(file),
    file,
    path,
    ext,
    type: 'doc',
    index: true,
  };
}

function assetFileToPath(file) {
  const ext = file.split('.').pop();
  const path = file.split('/').filter(part => part !== 'docs'); // get our path pieces // normalise to exclude docs in path

  return {
    id: id(file),
    file,
    path,
    ext,
    type: 'asset',
  };
}

function packageFileToPath(file) {
  const ext = file.split('.').pop();
  const path = file.split('/').filter(part => part !== 'docs'); // get our path pieces // normalise to exclude docs in path

  return {
    id: id(file),
    file,
    path,
    ext,
    type: 'pkg',
  };
}

function validate(paths) {
  // only one instance of each normalised path, conflicts should be resolved
  const conflicts = paths.filter(
    a => paths.filter(b => b.path.join('') === a.path.join('')).length > 1
  );

  if (conflicts.length) {
    const humanConflicts = conflicts
      .map(path => path.path.join('/'))
      .join(', ');
    console.warn(`oops! conflicts! ${humanConflicts}`);
  }

  return paths;
}

// resolve docs bootstrap
module.exports = async function resolveDocsLoader(source) {
  const finalise = this.async();
  this.cacheable(true);

  // track files added/removed from our target directory
  this.addContextDependency(this.options.context);

  const docPaths = glob('**/docs/**/*.{md,js,html}', {
    cwd: this.options.context,
    ignore: [
      '**/_[a-zA-Z]*', // filter _file
      '**/_[a-zA-Z]*/**/*', // filter _directory
      '**/node_modules/**', // filter node_modules
      '**/README.md', // filter readmes
    ],
  }).then(files => files.map(docFileToPath));

  const readmePaths = glob('**/README.md', {
    cwd: this.options.context,
    ignore: [
      '**/node_modules/**', // filter node_modules
    ],
  }).then(files => files.map(readmeFileToPath));

  const packagePaths = glob('**/package.json', {
    cwd: this.options.context,
    ignore: [
      '**/node_modules/**', // filter node_modules
    ],
  }).then(files => files.map(packageFileToPath));

  const licensePaths = glob('**/LICENSE.md', {
    cwd: this.options.context,
    ignore: [
      '**/node_modules/**', // filter node_modules
    ],
  }).then(files => files.map(assetFileToPath));

  const assetPaths = glob('**/docs/**/*.*', {
    cwd: this.options.context,
    ignore: [
      '**/_[a-zA-Z]*', // filter _file
      '**/_[a-zA-Z]*/**', // filter _directory
      '**/*.{md,html,js}', // filter first-class file types
      '**/node_modules/**', // filter node_modules
    ],
  }).then(files => files.map(assetFileToPath));

  const allPaths = await Promise.all([
    assetPaths,
    docPaths,
    readmePaths,
    packagePaths,
    licensePaths,
  ]).then(flatten);

  const paths = await Promise.resolve(allPaths)
    .then(validate)
    .then(enhancePaths.bind(this));
  const tree = await Promise.resolve(paths).then(buildTree).then(squashTree);

  const code = genCode(tree, paths);
  finalise(null, code);
};
