const fs = require('fs');
const path = require('path');
const deleteRecursive = require('./utils/delete-recursive');
const versions = require('../src/versions');

const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf8')
);

const deletePath = path.join(
  __dirname,
  '..',
  '..',
  'docs',
  pkg.name,
  versions.latestVersion
);
deleteRecursive(path.join(deletePath, 'fonts'));
deleteRecursive(path.join(deletePath, 'scripts'));
deleteRecursive(path.join(deletePath, 'styles'));
deleteRecursive(path.join(deletePath, 'index.html'));
