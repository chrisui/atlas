const glob = require('../../utils/glob');
const loaderUtils = require('loader-utils');
const flatten = require('lodash/flatten');

// TODO: This is a bit of a hacky use of loader. We would benefit from this resolution being a pre-webpack step however then do we lose incremental build/context watching capabilities?

// TODO: Load all modules here and extract meta data

function id(file) {
  return loaderUtils.getHashDigest(file, 'sha1', 'hex', 8);
}

function buildTree(paths) {
  return paths;
}

function enhancePaths(paths) {
  return paths;
}

function genCode(paths) {
  const data = path => JSON.stringify(path);
  const load = path => `function load() { return import('${path.file}')}`;
  const id = path => JSON.stringify(path.id);

  return `// this is a generated file from atlas
  
    export default [
      ${paths
    .map(path => `{id: ${id(path)}, data: ${data(path)}, load: ${load(path)}},`)
    .join('\n')}
    ];
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

function layoutFileToPath(file) {
  const ext = file.split('.').pop();
  const path = file
    .split('/') // get our path pieces
    .filter(part => part !== 'docs') // normalise to exclude docs in path
    .filter(part => part !== '_layout'); // normalise to exclude _layout in path

  return {
    id: id(file),
    file,
    path,
    ext,
    type: 'layout',
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
  // only one instance of each path, conflicts should be resolved
  return paths.every(
    a => paths.filter(b => b.path.join('') === a.path.join('')).length === 1
  );
}

// resolve docs bootstrap
module.exports = function resolveDocsLoader(source) {
  const finalise = this.async();

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

  const layoutPaths = glob('**/docs/_layout.js', {
    cwd: this.options.context,
    ignore: [
      '**/node_modules/**', // filter node_modules
    ],
  }).then(files => files.map(layoutFileToPath));

  const allPaths = Promise.all([
    assetPaths,
    docPaths,
    readmePaths,
    packagePaths,
    licensePaths,
    layoutPaths,
  ]).then(flatten);

  allPaths.then(paths => {
    const isValid = validate(paths);
    const enhancedPaths = enhancePaths(paths);
    const tree = buildTree(enhancedPaths);
    const code = genCode(tree);

    finalise(null, code);
  });
};
