import { writeFileSync } from 'fs';
import prettier from 'prettier';
import { parseDevice } from './build/process-devices.js';
import { parseTraits } from './build/process-traits.js';

const devices = [
  'camera',
  'switch',
  'thermostat',
  'fan',
  'microwave',
  'coffeemaker',
  'dehumidifier',
  'sensor',
];
const traitSets = new Set();
// traitSets.add('OnOff');

const deviceTypes = devices.map((x) => {
  const r = parseDevice(x);
  r.traitSets.forEach((x) => traitSets.add(x));
  //   traitSets.add(...r.);
  return {
    type: r.type,
    humanName: r.humanName,
    traits: r.traits,
  };
});

const acc = {};

console.log('traitSets', traitSets);

traitSets.forEach((x) => {
  console.log('parseTraits', x);
  parseTraits(acc, x);
});

// parseTraits(acc, 'onoff');
// parseTraits(acc, 'temperaturesetting');

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

writeFileSync('./src/device-types.ts', deviceTypesSource, 'utf8');

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
