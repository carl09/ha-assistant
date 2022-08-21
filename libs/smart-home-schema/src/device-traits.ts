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
  'action.devices.traits.OnOff': {
    type: 'action.devices.traits.OnOff',
    humanName: 'OnOff',
    states: {
      on: {
        type: 'boolean',
        description: 'Whether a device with an on/off switch is on or off.',
      },
    },
    attributes: {
      commandOnlyOnOff: {
        type: 'boolean',
        default: false,
        description:
          'Indicates if the device can only controlled through commands, and cannot be queried for state information.',
      },
      queryOnlyOnOff: {
        type: 'boolean',
        default: false,
        description:
          'Indicates if the device can only be queried for state information, and cannot be controlled through commands.',
      },
    },
    commands: [
      {
        command: 'action.devices.commands.OnOff',
        params: {
          on: {
            description: 'Whether to turn the device on or off.',
            type: 'boolean',
          },
        },
      },
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
      thermostatMode: {
        type: 'string',
        description:
          'Current mode of the device, from the list of <code>availableThermostatModes</code>.',
        supportedValues: [
          'none',
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
      thermostatTemperatureAmbient: {
        type: 'number',
        description: 'Current observed temperature, in degrees Celsius.',
      },
      thermostatTemperatureSetpoint: {
        type: 'number',
        description:
          'Current temperature set point (single target), in degrees Celsius.',
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
  'action.devices.traits.Timer': {
    type: 'action.devices.traits.Timer',
    humanName: 'Timer',
    states: {
      timerRemainingSec: {
        type: 'integer',
        description:
          'Current time remaining in seconds, -1, or [0, <code>maxTimerLimitSec</code>]. Set to -1 to indicate no timer is running.',
      },
      timerPaused: {
        type: 'boolean',
        description: 'True if a active timer exists but is currently paused.',
      },
    },
    attributes: {
      maxTimerLimitSec: {
        type: 'integer',
        description:
          'Indicates the longest timer setting available on the device, measured in seconds.',
      },
      commandOnlyTimer: {
        type: 'boolean',
        default: false,
        description:
          'Indicates if the device supports using one-way (true) or two-way (false) communication. Set this attribute to true if the device cannot respond to a QUERY intent or Report State for this trait.',
      },
    },
    commands: [
      {
        command: 'action.devices.commands.TimerStart',
        params: {
          timerTimeSec: {
            description:
              'Duration of the timer in seconds; must be within [1, <code>maxTimerLimitSec</code>].',
            type: 'integer',
          },
        },
      },
      {
        command: 'action.devices.commands.TimerAdjust',
        params: {
          timerTimeSec: {
            description:
              'Positive or negative adjustment of the timer in seconds; must be within [<code>-maxTimerLimitSec</code>, <code>maxTimerLimitSec</code>].',
            type: 'integer',
          },
        },
      },
      { command: 'action.devices.commands.TimerPause', params: {} },
      { command: 'action.devices.commands.TimerResume', params: {} },
      { command: 'action.devices.commands.TimerCancel', params: {} },
    ],
  },
  'action.devices.traits.StartStop': {
    type: 'action.devices.traits.StartStop',
    humanName: 'StartStop',
    states: {
      isRunning: {
        type: 'boolean',
        description: 'Indicates if the device is currently in operation.',
      },
      isPaused: {
        type: 'boolean',
        description:
          'Indicates if the device is explicitly paused. If this value is true, it implies <code>isRunning</code> is false but can be resumed.',
      },
      activeZones: {
        type: 'array',
        description:
          'Indicates zones in which the device is currently running, from list of <code>availableZones</code>.',
      },
    },
    attributes: {
      pausable: {
        type: 'boolean',
        default: false,
        description:
          'Indicates whether the device can be paused during operation.',
      },
      availableZones: {
        type: 'array',
        description:
          'Indicates supported zone names. Strings should be localized as set by the user. This list is not exclusive; users can report any names they want.',
      },
    },
    commands: [
      {
        command: 'action.devices.commands.StartStop',
        params: {
          start: {
            description: 'True to start device operation, false to stop.',
            type: 'boolean',
          },
          zone: {
            description: 'Indicates zone in which to start running.',
            type: 'string',
          },
          multipleZones: {
            description:
              'Indicates two or more zones in which to start running. Will be set instead of <code>zone<code> parameter.',
            type: 'array',
          },
        },
      },
      {
        command: 'action.devices.commands.PauseUnpause',
        params: {
          pause: {
            description: 'True to pause, false to unpause.',
            type: 'boolean',
          },
        },
      },
    ],
  },
  'action.devices.traits.TemperatureControl': {
    type: 'action.devices.traits.TemperatureControl',
    humanName: 'TemperatureControl',
    states: {
      temperatureSetpointCelsius: {
        type: 'number',
        description:
          'The current temperature setpoint, in degrees Celsius. Must fall within <code>temperatureRange</code>. Required if <code>queryOnlyTemperatureControl</code> set to <code>false</code>',
      },
      temperatureAmbientCelsius: {
        type: 'number',
        description:
          'The currently observed temperature, in degrees Celsius. Must fall within <code>temperatureRange</code>.',
      },
    },
    attributes: {
      temperatureRange: {
        type: 'object',
        description: 'Supported temperature range of the device.',
      },
      temperatureStepCelsius: {
        type: 'number',
        description:
          'Specifies the relative temperature step. This is the minimum adjustment interval the device supports. If unspecified, relative steps are calculated as a percentage of <code>temperatureRange</code>.',
      },
      temperatureUnitForUX: {
        type: 'string',
        description: 'Temperature unit used in responses to the user.',
      },
      commandOnlyTemperatureControl: {
        type: 'boolean',
        default: false,
        description:
          'Indicates if the device supports using one-way (true) or two-way (false) communication. Set this attribute to true if the device cannot respond to a QUERY intent or Report State for this trait.',
      },
      queryOnlyTemperatureControl: {
        type: 'boolean',
        default: false,
        description:
          'Required if the device supports query-only execution. This attribute indicates if the device can only be queried for state information, and cannot be controlled.',
      },
    },
    commands: [
      {
        command: 'action.devices.commands.SetTemperature',
        params: {
          temperature: {
            description:
              'The temperature to set, in degrees Celsius. Must fall within <code>temperatureRange</code>.',
            type: 'number',
          },
        },
      },
    ],
  },
  'action.devices.traits.HumiditySetting': {
    type: 'action.devices.traits.HumiditySetting',
    humanName: 'HumiditySetting',
    states: {
      humiditySetpointPercent: {
        type: 'integer',
        description:
          'Indicates the current target humidity percentage of the device. Must fall within <code>humiditySetpointRange</code>.',
      },
      humidityAmbientPercent: {
        type: 'integer',
        description:
          'Indicates the current ambient humidity reading of the device as a percentage.',
      },
    },
    attributes: {
      humiditySetpointRange: {
        type: 'object',
        description:
          'Contains the minimum and maximum humidity levels as percentages.',
      },
      commandOnlyHumiditySetting: {
        type: 'boolean',
        default: false,
        description:
          'Indicates if the device supports using one-way (true) or two-way (false) communication. Set this attribute to true if the device cannot respond to a QUERY intent or Report State for this trait.',
      },
      queryOnlyHumiditySetting: {
        type: 'boolean',
        default: false,
        description:
          'Required if the device supports query-only execution. This attribute indicates if the device can only be queried for state information, and cannot be controlled.',
      },
    },
    commands: [
      {
        command: 'action.devices.commands.SetHumidity',
        params: {
          humidity: {
            description:
              'Setpoint humidity percentage. Must fall within <code>humiditySetpointRange</code>.',
            type: 'integer',
          },
        },
      },
      { command: 'action.devices.commands.HumidityRelative', params: {} },
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
  'action.devices.traits.SensorState': {
    type: 'action.devices.traits.SensorState',
    humanName: 'SensorState',
    states: {
      currentSensorStateData: {
        type: 'array',
        description: 'List of current sensor states.',
      },
    },
    attributes: {
      sensorStatesSupported: {
        type: 'array',
        description:
          'Each object represents sensor state capabilities supported by this specific device. Each sensor must have at least a descriptive or numeric capability. Sensors can also report both, in which case the numeric value will be preferred.',
      },
    },
    commands: [],
  },
};
