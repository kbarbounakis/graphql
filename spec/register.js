const jsConfig = require('../jsconfig.json');
const path = require('path');
const { register } = require('tsconfig-paths');
// Register the paths from jsconfig.json
if (jsConfig.compilerOptions && jsConfig.compilerOptions.paths) {
  register({
    baseUrl: path.resolve(__dirname, '../'),
    paths: jsConfig.compilerOptions.paths,
  });
}