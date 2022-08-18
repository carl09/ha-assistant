/**
 * HA Modes: off, heat_cool, cool, heat, fan_only, dry
 * Google Modes: 'off', 'heat',  'cool', 'on', 'heatcool', 'auto', 'fan-only', 'purifier', 'eco', 'dry'
 * @param mode
 * @param mapping
 * @returns
 */
const baseThermostatMode = (
  mode: string | string[],
  mapping: { [key: string]: string }
): string | string[] | undefined => {
  const f = (value: string): string =>
    value in mapping ? mapping[value] : value;

  if (mode) {
    if (typeof mode === 'string') {
      return f(mode);
    }
    if (Array.isArray(mode)) {
      return mode.map((x) => f(x));
    }
  }
  return undefined;
};

export const deviceMappingFunctions: {
  [key: string]: (...args: any[]) => any;
} = {
  equals: (...args: any[]) => {
    // console.log('equals', args);
    return args[0] === args[1];
  },
  toNum: (...args: any[]) => {
    // console.log('toNum', args[0]);
    return parseFloat(args[0]);
  },
  toInt: (...args: any[]) => {
    // console.log('toInt', args[0]);
    return parseInt(args[0]);
  },
  toGoogleThermostatMode: (...args: any[]) => {
    const mapping: { [key: string]: string } = {
      heat_cool: 'heatcool',
      fan_only: 'fan-only',
    };
    return baseThermostatMode(args[0], mapping);
  },
  toHomeAssistantThermostatMode: (...args: any[]) => {
    const mapping: { [key: string]: string } = {
      heatcool: 'heat_cool',
      'fan-only': 'fan_only',
    };
    return baseThermostatMode(args[0], mapping);
  },
  toArray: (...args: any[]) => {
    const [item, seperator] = args;
    if (item) {
      if (Array.isArray(item)) {
        return item;
      }
      if (seperator && typeof item === 'string') {
        return item.split(seperator).map((x) => x.trim());
      }
      if (typeof item === 'string') {
        return item.split(',').map((x) => x.trim());
      }
    }
    return undefined;
  },
};
