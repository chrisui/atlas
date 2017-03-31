/* mocha-env jest */
const path = require('path');
const run = require('../index');

it('should work', () => {
  run({
    // context: path.resolve(__dirname, '../../../lystable-frontend'),
    context: path.resolve(__dirname, '__fixtures__/master/input'),
  });
});
