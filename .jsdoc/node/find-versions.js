const fs = require('fs');
const path = require('path');

module.exports = function() {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf8')
  );
  const majorMinorVersion = (pkg.version || '0.0.0').substr(0, 3);

  require('child_process').exec('git tag -l', (err, stdOut) => {
    let versions = [pkg.version];
    if (err) {
      console.log(err);
    }
    if (stdOut) {
      versions = stdOut.split('\n').filter(Boolean);
    }
    versions = [
      ...new Set(
        versions.map(version =>
          (version.replace('v', '') || '0.0.0').substr(0, 3)
        )
      ),
    ];
    const versionsText = `export default { versions: ${JSON.stringify(
      versions
    )}, latestVersion: "${majorMinorVersion}"};`;
    fs.writeFileSync(
      path.join(__dirname, '..', 'src', 'versions.js'),
      versionsText
    );
  });
};
