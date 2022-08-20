import { writeFileSync } from 'fs';
import prettier from 'prettier';
import { parseDevice } from './build/process-devices.js';
import { parseTraits } from './build/process-traits.js';

const devices = [
  'camera',
  'switch',
  'thermostat',
  'fan',
  //   'microwave',
  'coffeemaker',
  'dehumidifier',
  'sensor',
];
const traitSets = new Set();

const deviceTypes = devices.map((x) => {
  const r = parseDevice(x);
  traitSets.add(...r.traitSets);
  return {
    type: r.name,
    humanName: r.humanName,
    traits: r.traits,
  };
});

const acc = {};

traitSets.forEach((x) => {
  console.log('parseTraits', x);
  parseTraits(acc, x);
});

// parseTraits(acc, 'onoff');
// parseTraits(acc, 'temperaturesetting');

// console.log('acc', acc);

const deviceTypesSource = prettier.format(
  `
  import { IDeviceType } from './device-models';
  export const deviceTypes: IDeviceType[] = ${JSON.stringify(deviceTypes)}
  `,
  {
    parser: 'typescript',
    singleQuote: true,
  }
);

writeFileSync('./src/device-traits.ts', deviceTypesSource, 'utf8');

const deviceTraitsSource = prettier.format(
  `
  import { IDeviceTraits } from "./device-models";
  export const deviceTraits: { [trait: string]: IDeviceTraits } = ${JSON.stringify(
    acc
  )}
  `,
  {
    parser: 'typescript',
    singleQuote: true,
  }
);

writeFileSync('./src/device-traits.ts', deviceTraitsSource, 'utf8');
