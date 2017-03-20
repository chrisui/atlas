<p>&nbsp;</p>
<p align="center">
<img src="http://i.imgur.com/BRdEVYW.png" width="150px" />
</p>
<p>&nbsp;</p>

Atlas
=====

A whole world of documentation.

[![Build Status](https://travis-ci.org/chrisui/atlas.svg?branch=master)](https://travis-ci.org/lystable/atlas)

### What?

0 config pretty atlas of all your documentation. Write or generate your raw docs and then glue them together for your users in a pretty format.

### How?

Conventions! No config.

Anything under a `docs` directory (anywhere) is consumed

- `_files.ext` and `_dirs` are ignored
- Special `README.md` file can live as a sibling to `docs` (it acts as the index file)
- Special treatment of `.md`, `.js` and `.html` files
  - Write `.md` as if it was just living in GitHub
  - Write `.js` exporting a React component to render
  - Write `.html` as far as your imagination takes you
- Other files are discoverable (eg. `.png`, `.pdf` etc.)

How do I customise anything?

- `_layout.js`
  - Implement any way you want providing dependencies are prefixed with a `_`

Contributing
------------

- Bugs? Please submit a *Pull Request* with your a test which breaks.

For more details on all contributions see [CONTRIBUTING.md](./CONTRIBUTING.md)

License
-------

Apache 2.0
