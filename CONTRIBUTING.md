Contributing Guidelines
=======================

## Got a bug?

As much as possible please provide a minimal reproducible case. The best way to do this
is with a pull request including breaking tests!

## Got a feature idea?

We'd love to discuss it! Feel free to submit an issue. Just try to be as descriptive as you can
and preferably include code/output examples since that can really help.

## Developing Atlas

At an absolute minimum make sure `npm test` runs! :)

### Design

Stages:

1. Indexing and building manifest
  - Build tree of all docs, discovering first-class modules
  - Validation of docs tree
  - Build manifest file (a webpack consumable js module)
2. Webpack build consumes manifest and index
3. Parse different file types
  - All docs pages should provide a react component
4. Render the docs application
