import { IDeviceTraits } from './device-models';
export const deviceTraits: { [trait: string]: IDeviceTraits } = {
  'action.devices.traits.CameraStream': {
    type: 'action.devices.traits.CameraStream',
    humanName: 'CameraStream',
    states: {},
    attributes: {
      cameraStreamSupportedProtocols: {
        type: 'array',
        description:
          'Supported media types for the camera stream, ordered by preference. Typically, the first protocol in this array that is compatible with the target surface is requested.',
      },
      cameraStreamNeedAuthToken: {
        type: 'boolean',
        description:
          'Whether an auth token will be provided via <code>cameraStreamAuthToken</code> for the target surface to stream the camera feed.',
      },
    },
    commands: [
      {
        command: 'action.devices.commands.GetCameraStream',
        params: {
          StreamToChromecast: {
            description:
              'Whether the stream will be played on a Chromecast device.',
            type: 'boolean',
          },
          SupportedStreamProtocols: {
            description:
              'Media types/formats supported by the desired destination.',
            type: 'array',
            supportedValues: [
              'hls',
              'dash',
              'smooth_stream',
              'progressive_mp4',
              'webrtc',
            ],
          },
        },
      },
    ],
  },
  'action.devices.traits.Brightness': {
    type: 'action.devices.traits.Brightness',
    humanName: 'Brightness',
    states: {
      brightness: {
        type: 'integer',
        description: 'Current brightness level of the device.',
      },
    },
    attributes: {
      commandOnlyBrightness: {
        type: 'boolean',
        default: false,
        description:
          'Indicates if the device supports using one-way (true) or two-way (false) communication. Set this attribute to true if the device cannot respond to a QUERY intent or Report State for this trait.',
      },
    },
    commands: [
      {
        command: 'action.devices.commands.BrightnessAbsolute',
        params: {
          brightness: {
            description: 'New absolute brightness percentage.',
            type: 'integer',
          },
        },
      },
      { command: 'action.devices.commands.BrightnessRelative', params: {} },
    ],
  },
  'action.devices.traits.TemperatureSetting': {
    type: 'action.devices.traits.TemperatureSetting',
    humanName: 'TemperatureSetting',
    states: {
      activeThermostatMode: {
        type: 'string',
        description:
          'Currently active mode of the device, from the list of <code>availableThermostatModes</code>. If no mode is currently active, set to <code>none</code>.',
      },
      targetTempReachedEstimateUnixTimestampSec: {
        type: 'integer',
        description:
          'A timestamp representing the estimated time when the target temperature will be reached.',
      },
      thermostatHumidityAmbient: {
        type: 'number',
        description:
          'Represents the relative level of the ambient humidity, if supported by the device.',
      },
    },
    attributes: {
      availableThermostatModes: {
        type: 'array',
        description: 'List of modes supported by this specific device.',
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
      thermostatTemperatureRange: {
        type: 'object',
        description:
          'Contains two float values that indicate the supported temperature range for this device (in degrees Celsius).',
      },
      thermostatTemperatureUnit: {
        type: 'string',
        description:
          'The display unit the device is set to by default. Google reports temperature information using the display unit.',
      },
      bufferRangeCelsius: {
        type: 'number',
        default: 2,
        description:
          'Specifies the minimum offset between heat-cool setpoints in degrees Celsius, if <code>heatcool</code> mode is supported.',
      },
      commandOnlyTemperatureSetting: {
        type: 'boolean',
        default: false,
        description:
          'Indicates if the device supports using one-way (true) or two-way (false) communication. Set this attribute to true if the device cannot respond to a QUERY intent or Report State for this trait.',
      },
      queryOnlyTemperatureSetting: {
        type: 'boolean',
        default: false,
        description:
          'Required if the device supports query-only execution. This attribute indicates if the device can only be queried for state information, and cannot be controlled.',
      },
    },
    commands: [
      {
        command: 'action.devices.commands.ThermostatTemperatureSetpoint',
        params: {
          thermostatTemperatureSetpoint: {
            description:
              'Target temperature setpoint. Supports up to one decimal place.',
            type: 'number',
          },
        },
      },
      {
        command: 'action.devices.commands.ThermostatTemperatureSetRange',
        params: {
          thermostatTemperatureSetpointHigh: {
            description:
              'High target setpoint for the range. Requires <code>heatcool</code> mode support.',
            type: 'number',
          },
          thermostatTemperatureSetpointLow: {
            description:
              'Low target setpoint for the range. Requires <code>heatcool</code> mode support.',
            type: 'number',
          },
        },
      },
      {
        command: 'action.devices.commands.ThermostatSetMode',
        params: {
          thermostatMode: {
            description:
              'Target mode, from the list of <code>availableThermostatModes</code>.',
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
          },
        },
      },
      { command: 'action.devices.commands.TemperatureRelative', params: {} },
    ],
  },
  'action.devices.traits.FanSpeed': {
    type: 'action.devices.traits.FanSpeed',
    humanName: 'FanSpeed',
    states: {
      currentFanSpeedSetting: {
        type: 'string',
        description:
          'This represents the internal name of the current speed setting from the <code>availableFanSpeeds</code> attribute.',
      },
      currentFanSpeedPercent: {
        type: 'number',
        description:
          'Indicates the current fan speed by percentage. Required if <code>supportsFanSpeedPercent</code> attribute is set to <code>true</code>',
      },
    },
    attributes: {
      reversible: {
        type: 'boolean',
        default: false,
        description:
          'If set to true, this device supports blowing the fan in both directions and can accept the command to reverse fan direction.',
      },
      commandOnlyFanSpeed: {
        type: 'boolean',
        default: false,
        description:
          'Indicates if the device supports using one-way (true) or two-way (false) communication. Set this attribute to true if the device cannot respond to a QUERY intent or Report State for this trait.',
      },
    },
    commands: [
      { command: 'action.devices.commands.SetFanSpeed', params: {} },
      { command: 'action.devices.commands.SetFanSpeedRelative', params: {} },
      { command: 'action.devices.commands.Reverse', params: {} },
    ],
  },
  'action.devices.traits.Cook': {
    type: 'action.devices.traits.Cook',
    humanName: 'Cook',
    states: {
      currentCookingMode: {
        type: 'string',
        description:
          'Describes the current cooking mode set on the device, from the list of <code>supportedCookingModes</code> attribute. Only one mode may be reported. If no mode is currently selected, this should be set to NONE.',
      },
      currentFoodPreset: {
        type: 'string',
        description:
          'Describes the current food cooking in the device, from the list of <code>foodPresets</code> attribute. Only one food may be reported. If no food is currently selected, this should be set to NONE.',
      },
      currentFoodQuantity: {
        type: 'number',
        description:
          'Defines the current amount of food cooking associated with the <code>currentFoodUnit</code>, if a quantity was specified. Should not be reported if nothing is currently cooking, or if there is no quantity associated with this food preset.',
      },
      currentFoodUnit: {
        type: 'string',
        description:
          'The unit associated with the <code>currentFoodQuantity</code>, from the list of <code>supported_units</code> attribute.',
      },
    },
    attributes: {
      supportedCookingModes: {
        type: 'array',
        description: 'Cooking modes supported by this device.',
      },
      foodPresets: {
        type: 'array',
        description: 'Presets for certain types of food.',
      },
    },
    commands: [
      {
        command: 'action.devices.commands.Cook',
        params: {
          start: {
            description:
              'True to start cooking, false to stop current cooking mode.',
            type: 'boolean',
          },
          cookingMode: {
            description:
              'Requested cooking mode for the device, from the <code>supportedCookingModes</code> attribute.',
            type: 'string',
          },
          foodPreset: {
            description:
              'The name of the food preset requested by the user, from <code>foodPresets</code> attribute.',
            type: 'string',
          },
          quantity: {
            description: 'The quantity of the food requested by the user.',
            type: 'number',
          },
          unit: {
            description:
              'The unit associated with the <code>quantity</code>, from <code>supported_units</code> attribute.',
            type: 'string',
          },
        },
      },
    ],
  },
  'action.devices.traits.EnergyStorage': {
    type: 'action.devices.traits.EnergyStorage',
    humanName: 'EnergyStorage',
    states: {
      descriptiveCapacityRemaining: {
        type: 'string',
        description:
          "A qualitative description of the energy capacity level. Note this is for when there's no numeric capacity data. If numeric capacity data is also available, it will be preferred over descriptive when possible.",
      },
      capacityRemaining: {
        type: 'array',
        description:
          'Array of unit/value pairs that hold information on the energy capacity the device currently holds. For example: <i>How many miles does my &lt;device&gt; currently have</i> or <i>What percentage charge does my &lt;device&gt; have</i>',
      },
      capacityUntilFull: {
        type: 'array',
        description:
          'Array of unit/value pairs that hold information on the capacity until the device is fully charged. For example: <i>How much time until &lt;device&gt; is fully charged</i>.',
      },
      isCharging: {
        type: 'boolean',
        description: 'Whether the device is currently charging.',
      },
      isPluggedIn: {
        type: 'boolean',
        description:
          'Whether the device is currently plugged in. The device can be plugged in, but not actively charging.',
      },
    },
    attributes: {
      queryOnlyEnergyStorage: {
        type: 'boolean',
        description:
          'True if this device only supports queries about the stored energy levels and, optionally, active charging state (dependent on <code>isRechargeable</code> attribute), but does not support starting and stopping charging.',
      },
      energyStorageDistanceUnitForUX: {
        type: 'string',
        default: 'KILOMETERS',
        description: 'Will be used in responses to the user.',
      },
      isRechargeable: {
        type: 'boolean',
        default: false,
        description:
          'Set to true if this device is rechargeable. This indicates the device may report <code>capacityUntilFull</code>, <code>isCharging</code>, and optionally <code>isPluggedIn</code> state, and can accept the <code>Charge</code> command.',
      },
    },
    commands: [
      {
        command: 'action.devices.commands.Charge',
        params: {
          charge: {
            description: 'True to start charging, false to stop charging.',
            type: 'boolean',
          },
        },
      },
    ],
  },
};
