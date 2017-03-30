<p>&nbsp;</p>
<p align="center">
[Insert sweet logo here]
</p>
<p>&nbsp;</p>

Atlas
=====

A whole world of documentation.

[![Build Status](https://travis-ci.org/chrisui/atlas.svg?branch=master)](https://travis-ci.org/lystable/atlas)

### What? :earth_africa:

zero-config, pretty, highly discoverable atlas of all your documentation.

Write your docs as usual close to their relevant components and then generate from any* level!

**Works great with monorepos!*

### How? :earth_asia:

Conventions! No config.

Anything under a `docs` directory (anywhere) is consumed

- Special `README.md` file can live as a sibling to `docs` (it acts as the index file)
- Special treatment of `.md`, `.js` and `.html` files
  - Write `.md` as if it was just living in GitHub
  - Write `.js` exporting a React component to render
  - Write `.html` as far as your imagination takes you
- Other files are discoverable (eg. `.png`, `.pdf` etc.)
- Underscore prefixed `_files.ext` and `_dirs` are ignored
- If you reference files outside of `docs` we'll pull those in too!
- More special files to provide as much meta data in your docs as we can and reduce duplication
  - `package.json`
  - `LICENSE.x`

How do I customise anything?

- `_layout.js`

### More! :earth_americas:

Additional features?

- First-class Github support
  - Link to "contribute"/"edit"
  - Pull in contributors to each documentation file
- First-class npm support
  - Link to issues
  - Show dependants and dependencies
  - Link/embed the docs of your dependencies

Contributing
------------

- Bugs? Please submit a *Pull Request* with a test which breaks.
- Ideas? Open an issue and let's chat! :)

For more details on all contributions see [CONTRIBUTING.md](./CONTRIBUTING.md)

License
-------

Apache 2.0
