const path = require('path');
const fs = require('fs');

const package = require('./package.json');

const entries = ['server', 'client'];

function htmlTarget(title, name, chunks, body) {
  return {
    inject: true,
    title: `WebMUD - ${title}`,
    filename: `${name}.html`,
    chunks,
    template: path.resolve(__dirname, `src/common/template.html`),
    package,
    body: fs.readFileSync(body),
  };
}

const html = [
  htmlTarget(
    'Welcome',
    'index',
    [],
    path.resolve(__dirname, `src/common/index.html`)
  ),

  htmlTarget(
    'Server',
    'server',
    ['server'],
    path.resolve(__dirname, `src/server/index.html`)
  ),

  htmlTarget(
    'Client',
    'client',
    ['client'],
    path.resolve(__dirname, `src/client/index.html`)
  ),
];

module.exports = {
  entries,
  html,
  entry: Object.assign(
    {},
    ...entries.map(name => ({
      [name]: path.resolve(__dirname, `src/${name}/index.ts`),
    }))
  ),
};
