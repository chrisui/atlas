/* mocha-env jest */
const path = require('path');
const run = require('../index');

it('should work', () => {
  run({
    root: path.resolve(__dirname, '__fixtures__/master/input'),
  });
});
