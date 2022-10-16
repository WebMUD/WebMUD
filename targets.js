const path = require('path');
const fs = require('fs');

const package = require('./package.json');

const entries = ['server', 'client', 'dev'];

module.exports = {
  entries,
  entry: Object.assign(
    {},
    ...entries.map(name => ({
      [name]: path.resolve(__dirname, `src/${name}/index.ts`),
    }))
  ),
};
