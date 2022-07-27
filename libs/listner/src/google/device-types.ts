// https://developers.google.com/assistant/smarthome/guides/thermostat#request
// https://developers.google.com/assistant/smarthome/traits/onoff

export interface IDeviceType {
  type: string;
  humanName: string;
  attributes?: { [key: string]: string };
  traits: string[];
}

export interface IDeviceTraits {
  type: string;
  humanName: string;
  attributes: {
    [name: string]: {
      type: 'string' | 'array' | 'number' | 'boolean' | 'integer' | 'object';
      required?: boolean;
      supportedValues?: string[];
      hint: string;
    };
  };
  states: {
    [name: string]: {
      type: 'string' | 'array' | 'number' | 'boolean' | 'integer' | 'object';
      required?: boolean;
      supportedValues?: string[];
      hint: string;
    };
  };
  commands: string[];
}

export const deviceTypes: IDeviceType[] = [
  {
    type: 'action.devices.types.CAMERA',
    humanName: 'Camera',
    attributes: {
      cameraStreamSupportedProtocols: 'array',
      cameraStreamNeedAuthToken: 'boolean',
      cameraStreamNeedDrmEncryption: 'boolean',
    },
    traits: ['action.devices.traits.CameraStream'],
  },
  {
    type: 'action.devices.types.THERMOSTAT',
    humanName: 'Thermostat',
    traits: ['action.devices.traits.TemperatureSetting'],
  },
  {
    type: 'action.devices.types.SWITCH',
    humanName: 'Switch',
    traits: ['action.devices.traits.OnOff'],
  },
  {
    type: 'action.devices.types.SPEAKER',
    humanName: 'Speaker',
    traits: ['action.devices.traits.Volume'],
  },
  {
    type: 'action.devices.types.LIGHT',
    humanName: 'Light',
    traits: ['action.devices.traits.OnOff'],
  },
  {
    type: 'action.devices.types.FAN',
    humanName: 'Fan',
    traits: ['action.devices.traits.OnOff'],
  },
  {
    type: 'action.devices.types.MICROWAVE',
    humanName: 'Microwave',
    traits: ['action.devices.traits.OnOff'],
  },
  {
    type: 'action.devices.types.COFFEE_MAKER',
    humanName: 'Coffee Maker',
    traits: ['action.devices.traits.OnOff'],
  },
  {
    type: 'action.devices.types.AC_UNIT',
    humanName: 'AC Unit',
    traits: [],
  },
];

export const deviceTraits: { [trait: string]: IDeviceTraits } = {
  'action.devices.traits.CameraStream': {
    type: 'action.devices.traits.CameraStream',
    humanName: 'CameraStream',
    states: {},
    attributes: {},
    commands: [],
  },
  'action.devices.traits.TemperatureSetting': {
    type: 'action.devices.traits.TemperatureSetting',
    humanName: 'TemperatureSetting',
    states: {
      activeThermostatMode: {
        type: 'string',
        supportedValues: [
          'off',
          'heat',
          'cool',
          'on',
          'heatcool',
          'auto',
          'fan-only',
          'purifier',
          'eco',
          'dry',
        ],
        hint: 'Currently active mode of the device, from the list of availableThermostatModes. If no mode is currently active, set to none.',
      },
      targetTempReachedEstimateUnixTimestampSec: {
        type: 'integer',
        hint: 'A timestamp representing the estimated time when the target temperature will be reached.',
      },
      thermostatHumidityAmbient: {
        type: 'number',
        hint: 'Represents the relative level of the ambient humidity, if supported by the device.',
      },
      thermostatMode: {
        type: 'string',
        required: true,
        supportedValues: [
          'off',
          'heat',
          'cool',
          'on',
          'heatcool',
          'auto',
          'fan-only',
          'purifier',
          'eco',
          'dry',
        ],
        hint: 'Current mode of the device, from the list of availableThermostatModes.',
      },
      thermostatTemperatureAmbient: {
        type: 'number',
        required: true,
        hint: 'Current observed temperature, in degrees Celsius.',
      },
      thermostatTemperatureSetpoint: {
        type: 'number',
        required: true,
        hint: 'Current temperature set point (single target), in degrees Celsius.',
      },
    },
    attributes: {
      availableThermostatModes: {
        type: 'array',
        required: true,
        supportedValues: [
          'off',
          'heat',
          'cool',
          'on',
          'heatcool',
          'auto',
          'fan-only',
          'purifier',
          'eco',
          'dry',
        ],
        hint: 'Describes the thermostat modes this device can support.',
      },
      thermostatTemperatureRange: {
        type: 'object',
        hint: 'Contains two float values that indicate the supported temperature range for this device (in degrees Celsius).',
      },
      minThresholdCelsius: {
        type: 'number',
        required: true,
        hint: 'Minimum threshold of the temperature range.',
      },
      maxThresholdCelsius: {
        type: 'number',
        required: true,
        hint: 'Maximum threshold of the temperature range.',
      },
      thermostatTemperatureUnit: {
        type: 'string',
        required: true,
        supportedValues: ['C', 'F'],
        hint: 'The display unit the device is set to by default. Google reports temperature information using the display unit.',
      },
    },
    commands: [
      'action.devices.commands.ThermostatTemperatureSetpoint',
      'action.devices.commands.ThermostatTemperatureSetRange',
      'action.devices.commands.ThermostatSetMode',
      'action.devices.commands.TemperatureRelative',
    ],
  },
  'action.devices.traits.OnOff': {
    type: 'action.devices.traits.OnOff',
    humanName: 'OnOff',
    states: {
      on: {
        type: 'boolean',
        required: true,
        hint: 'Whether a device with an on/off switch is on or off.',
      },
    },
    attributes: {
      commandOnlyOnOff: {
        type: 'boolean',
        hint: 'Indicates if the device can only controlled through commands, and cannot be queried for state information.',
      },
      queryOnlyOnOff: {
        type: 'boolean',
        hint: 'Indicates if the device can only be queried for state information, and cannot be controlled through commands.',
      },
    },
    commands: ['action.devices.commands.OnOff'],
  },
  'action.devices.traits.Volume': {
    type: 'action.devices.traits.Volume',
    humanName: 'Volume',
    states: {},
    attributes: {},
    commands: [],
  },
  'action.devices.traits.FanSpeed': {
    type: 'action.devices.traits.FanSpeed',
    humanName: 'FanSpeed',
    states: {},
    attributes: {},
    commands: [],
  },
};
