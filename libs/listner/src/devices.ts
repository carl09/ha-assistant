import { Observable } from 'rxjs';
import { getDevicesFromProps } from './devices-props';

export interface IDeviceSubs {
  [entityId: string]: {
    key: string;
    prop: string;
    expression: string;
  }[];
}

export interface IDevice {
  name: string;
  subs: IDeviceSubs;
}

export interface IDeviceV2 {
  name: string;
  status: { [key: string]: any };
  subs: { [key: string]: any };
}

const getDeviceDehumidifier = () => ({
  // online: true,
  on: `equals(switch.kogan_8.state, 'on')`,
  currentFanSpeedSetting: 'low_key',
  humiditySetpointPercent: '40',
  humidityAmbientPercent: 'sensor.d1_mini_3_humidity.state',
});

const getDeviceClimate = (deviceName: string) => ({
  thermostatMode: `climate.${deviceName}_climate.state`,
  thermostatTemperatureSetpoint: `climate.${deviceName}_climate.temperature`,
  thermostatTemperatureAmbient: `sensor.${deviceName}_temperature.state`,
  thermostatHumidityAmbient: `sensor.${deviceName}_humidity.state`,
});

const getDeviceSubsV2 = (device: any): { [key: string]: any } =>
  Object.keys(device).reduce<{ [key: string]: any }>((acc, x) => {
    const list = getDevicesFromProps(device[x]);

    if (list) {
      list.forEach((item) => {
        const key = `${item.domain}.${item.name}`;
        acc[key] = true;
      });
    }
    return acc;
  }, {});

export const getDevicesV2$: Observable<{
  devices: IDeviceV2[];
  allSubs: { [key: string]: any };
}> = new Observable((sub) => {
  const fakeDevices: { [key: string]: any } = {
    d1_mini_4: getDeviceClimate('d1_mini_4'),
    d1_mini_3: getDeviceClimate('d1_mini_3'),
    wroom_32_1: getDeviceClimate('wroom_32_1'),
    dehumidifier: getDeviceDehumidifier(),
  };

  console.warn('getDeviceSubs', fakeDevices);

  const deviceSubs = Object.keys(fakeDevices).map((x) => ({
    name: x,
    status: fakeDevices[x],
    subs: getDeviceSubsV2(fakeDevices[x]),
  }));

  sub.next({
    devices: deviceSubs,
    allSubs: deviceSubs.reduce<{ [key: string]: any }>((acc, i) => {
      acc = { ...(acc || {}), ...i.subs };
      return acc;
    }, {}),
  });
});
