const fs = require('fs');
const path = require('path');
const versions = require('./src/versions');
const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
);

module.exports = {
  source: {
    include: ['./src/'],
  },
  opts: {
    destination: `./docs/${pkg.name}/${versions.latestVersion}`,
    recurse: true,
  },
  templates: {
    default: {
      outputSourceFiles: false,
    },
  },
};
