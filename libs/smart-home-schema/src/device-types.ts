import { IDeviceType } from './device-models';
export const deviceTypes: IDeviceType[] = [
  {
    type: 'action.devices.types.CAMERA',
    humanName: 'Camera',
    traits: ['action.devices.traits.CameraStream'],
  },
  {
    type: 'action.devices.types.SWITCH',
    humanName: 'Switch',
    traits: ['action.devices.traits.OnOff'],
  },
  {
    type: 'action.devices.types.THERMOSTAT',
    humanName: 'Thermostat',
    traits: ['action.devices.traits.TemperatureSetting'],
  },
  {
    type: 'action.devices.types.FAN',
    humanName: 'Fan',
    traits: ['action.devices.traits.FanSpeed', 'action.devices.traits.OnOff'],
  },
  {
    type: 'action.devices.types.MICROWAVE',
    humanName: 'Microwave',
    traits: ['action.devices.traits.StartStop'],
  },
  {
    type: 'action.devices.types.COFFEE_MAKER',
    humanName: 'Coffee Maker',
    traits: ['action.devices.traits.OnOff'],
  },
  {
    type: 'action.devices.types.DEHUMIDIFIER',
    humanName: 'Dehumidifier',
    traits: ['action.devices.traits.OnOff'],
  },
  {
    type: 'action.devices.types.SENSOR',
    humanName: 'Sensor',
    traits: ['action.devices.traits.SensorState'],
  },
  {
    type: 'action.devices.types.BLINDS',
    humanName: 'Blinds',
    traits: ['action.devices.traits.OpenClose'],
  },
];
