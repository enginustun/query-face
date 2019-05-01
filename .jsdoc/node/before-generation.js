const fs = require('fs');
const path = require('path');
const deleteRecursive = require('./utils/delete-recursive');
const findVersions = require('./find-versions');

const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf8')
);

const majorMinorVersion = (pkg.version || '0.0.0').substr(0, 3);

findVersions();
deleteRecursive(
  path.join(__dirname, '..', '..', 'docs', pkg.name, majorMinorVersion)
);
