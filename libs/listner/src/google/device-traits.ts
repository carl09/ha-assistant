import { IDeviceTraits } from "./device-models";

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
      {
        command: 'action.devices.commands.ThermostatTemperatureSetpoint',
        params: {
          thermostatTemperatureSetpoint: {
            type: 'number',
            hint: 'Target temperature setpoint. Supports up to one decimal place.',
            required: true,
          },
        },
      },
      {
        command: 'action.devices.commands.ThermostatTemperatureSetRange',
        params: {
          thermostatTemperatureSetpointHigh: {
            type: 'number',
            hint: 'High target setpoint for the range. Requires heatcool mode support.',
            required: true,
          },
          thermostatTemperatureSetpointLow: {
            type: 'number',
            hint: 'Low target setpoint for the range. Requires heatcool mode support.',
            required: true,
          },
        },
      },
      {
        command: 'action.devices.commands.ThermostatSetMode',
        params: {
          thermostatMode: {
            type: 'string',
            hint: 'Target mode, from the list of availableThermostatModes.',
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
          },
        },
      },
      {
        command: 'action.devices.commands.TemperatureRelative',
        params: {
          thermostatTemperatureRelativeDegree: {
            type: 'number',
            hint: 'The exact number of degrees for the temperature to change (for example, "Turn down 5 degrees").',
            required: true,
          },
          thermostatTemperatureRelativeWeight: {
            type: 'integer',
            hint: 'This indicates the amount of ambiguous temperature change from a small amount ("Turn down a little"), to a large amount ("A lot warmer").',
            required: true,
          },
        },
      },
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
    commands: [
      {
        command: 'action.devices.commands.OnOff',
        params: {
          on: {
            type: 'boolean',
            required: true,
            hint: 'Whether to turn the device on or off.',
          },
        },
      },
    ],
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
  'action.devices.traits.HumiditySetting': {
    type: 'action.devices.traits.HumiditySetting',
    humanName: 'HumiditySetting',
    states: {},
    attributes: {},
    commands: [],
  },
  'action.devices.traits.StartStop': {
    type: 'action.devices.traits.StartStop',
    humanName: 'StartStop',
    states: {
      humiditySetpointPercent: {
        type: 'integer',
        hint: 'Indicates the current target humidity percentage of the device. Must fall within humiditySetpointRange.',
      },
      humidityAmbientPercent: {
        type: 'integer',
        hint: 'Indicates the current ambient humidity reading of the device as a percentage.',
      },
    },
    attributes: {},
    commands: [],
  },
};
