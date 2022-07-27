import * as fs from 'fs';
import semver from 'semver';
import prettier from 'prettier';

const config = JSON.parse(fs.readFileSync('./local_google/config.json'));
const f = semver.parse(config.version);
const newVersion = semver.inc(f, 'patch');
console.log('New Version', newVersion);
config.version = newVersion;

const updatedConfig = prettier.format(JSON.stringify(config), {
  parser: 'json',
});

fs.writeFileSync('./local_google/config.json', updatedConfig, 'utf8');
