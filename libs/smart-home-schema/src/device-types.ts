import { IDeviceType } from './device-models';
export const deviceTypes: IDeviceType[] = [
  {
    type: 'action.devices.types.CAMERA',
    humanName: 'Camera',
    traits: ['CameraStream'],
  },
  {
    type: 'action.devices.types.SWITCH',
    humanName: 'Switch',
    traits: ['OnOff'],
  },
  {
    type: 'action.devices.types.THERMOSTAT',
    humanName: 'Thermostat',
    traits: ['TemperatureSetting'],
  },
  {
    type: 'action.devices.types.FAN',
    humanName: 'Fan',
    traits: ['FanSpeed', 'OnOff'],
  },
  {
    type: 'action.devices.types.MICROWAVE',
    humanName: 'Microwave',
    traits: ['StartStop'],
  },
  {
    type: 'action.devices.types.COFFEE_MAKER',
    humanName: 'Coffee Maker',
    traits: ['OnOff'],
  },
  {
    type: 'action.devices.types.DEHUMIDIFIER',
    humanName: 'Dehumidifier',
    traits: ['OnOff'],
  },
  {
    type: 'action.devices.types.SENSOR',
    humanName: 'Sensor',
    traits: ['SensorState'],
  },
];

