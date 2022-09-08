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

type deviceFunctionMap = {
  fn: (...args: any[]) => any;
  label: string;
  detail: string;
  info?: string;
};

export const deviceMappingFunctions: {
  [key: string]: deviceFunctionMap; // (...args: any[]) => any;
} = {
  equals: {
    label: 'equals',
    detail: 'compare to values',
    fn: (...args: any[]) => {
      // console.log('equals', args);
      return args[0] === args[1];
    },
  },
  toNum: {
    label: 'toNum',
    detail: 'converts string to number',
    info: 'some really foon info to help me',
    fn: (...args: any[]) => {
      // console.log('toNum', args[0]);
      return parseFloat(args[0]);
    },
  },
  toInt: {
    label: 'toInt',
    detail: 'converts string to int',
    fn: (...args: any[]) => {
      // console.log('toInt', args[0]);
      return parseInt(args[0]);
    },
  },
  toGoogleThermostatMode: {
    label: 'toGoogleThermostatMode',
    detail: 'converts Home Assistant modes to Google',
    fn: (...args: any[]) => {
      const mapping: { [key: string]: string } = {
        heat_cool: 'heatcool',
        fan_only: 'fan-only',
      };
      return baseThermostatMode(args[0], mapping);
    },
  },
  toHomeAssistantThermostatMode: {
    label: 'toHomeAssistantThermostatMode',
    detail: 'converts Google modes to Home Assistant',
    fn: (...args: any[]) => {
      const mapping: { [key: string]: string } = {
        heatcool: 'heat_cool',
        'fan-only': 'fan_only',
      };
      return baseThermostatMode(args[0], mapping);
    },
  },
  toArray: {
    label: 'toArray',
    detail: 'converts string to a array, default , seperated',
    fn: (...args: any[]) => {
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
  },
  isValidState: {
    label: 'isValidState',
    detail: 'Checks stats and defines it is valid',
    fn: (...args: any[]) => {
      const [value] = args;
      if (value && typeof value === 'string') {
        if (value === 'unavailable' || value === 'unknown') {
          return false;
        }
        return true;
      }
      return false;
    },
  },
};
