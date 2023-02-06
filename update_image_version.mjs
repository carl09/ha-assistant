import * as fs from 'fs';
import semver from 'semver';
import prettier from 'prettier';
import yaml from 'js-yaml';

const config = yaml.load(fs.readFileSync('./local_google/config.yaml'));
const f = semver.parse(config.version);
const newVersion = semver.inc(f, 'patch');
console.log('New Version', newVersion);
config.version = newVersion;

const updatedConfig = prettier.format(yaml.dump(config), {
  parser: 'yaml',
});

fs.writeFileSync('./local_google/config.yaml', updatedConfig, 'utf8');

const packageJson = JSON.parse(fs.readFileSync('./apps/agent/package.json'));

packageJson.version = newVersion;

const updatedPackageJson = prettier.format(JSON.stringify(packageJson), {
  parser: 'json',
});

fs.writeFileSync('./apps/agent/package.json', updatedPackageJson, 'utf8');
