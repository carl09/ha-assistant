import { IDeviceTraits, IDeviceType } from './device-models';

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
  {
    type: 'action.devices.types.DEHUMIDIFIER',
    humanName: 'Dehumidifier',
    traits: [
      'action.devices.traits.OnOff',
      'action.devices.traits.FanSpeed',
      'action.devices.traits.HumiditySetting',
      'action.devices.traits.StartStop',
    ],
  },
];
