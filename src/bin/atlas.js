#!/usr/bin/env node
const program = require('commander');
const pkg = require('../../package.json');
const run = require('../index');

program.version(pkg.version).parse(process.argv);

run({context: process.cwd()});
