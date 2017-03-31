const webpack = require('webpack');
const makeConfig = require('./build/makeConfig.js');
const webpackDevServer = require('webpack-dev-server');

function run(config) {
  const webpackConfig = makeConfig(config);

  const compiler = webpack(webpackConfig);

  const server = new webpackDevServer(compiler, {
    stats: {
      colors: true,
    },
    overlay: {
      warnings: false,
      errors: true,
    },
    hot: true,
    historyApiFallback: true,
  });

  server.listen(8080, '127.0.0.1', function() {
    console.log('Starting server on http://localhost:8080');
  });

  /*
  compiler.watch({}, (err, stats) => {
    if (err) {
      console.log(err);
    } else if (stats.hasErrors()) {
      console.log(stats.toJson().errors);
      console.log('Oh no! Errors :(');
    } else {
      console.log(stats);
      console.log('SUCCESS! :D');
    }
  });
  */
}

module.exports = run;

// TODO: Remove debugging
const path = require('path');
run({
  context: path.resolve(__dirname, '../../lystable-frontend'),
  //context: path.resolve(__dirname, '__tests__/__fixtures__/master/input')
});
