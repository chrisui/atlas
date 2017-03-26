// empty module, abusing loaders...
// this will end up being replaced by a module with the
// signature of below code

export default [
  {
    path: 'path/to/module',
    load: () => import('path/to/module'),
  },
];
