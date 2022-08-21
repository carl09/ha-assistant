import { logging } from '../utils/logging';
import { firstValueFrom, map, Observable, shareReplay } from 'rxjs';
import { fileStore$, writeToFile } from './base';
import { v4 as uuidv4 } from 'uuid';

const getDeviceDehumidifier = () => ({
  // online: true,
  on: `equals(switch.kogan_8.state, 'on')`,
  currentFanSpeedSetting: 'low_key',
  humiditySetpointPercent: '40',
  humidityAmbientPercent: 'toInt(sensor.d1_mini_3_humidity.state)',
});

const getDeviceClimate = (deviceName: string) => ({
  thermostatMode: `climate.${deviceName}_climate.state`,
  thermostatTemperatureSetpoint: `toInt(climate.${deviceName}_climate.temperature)`,
  thermostatTemperatureAmbient: `toInt(sensor.${deviceName}_temperature.state)`,
  thermostatHumidityAmbient: `toInt(sensor.${deviceName}_humidity.state)`,
});

export interface IDeviceCommand {
  command: string;
  args?: string;
  target: string;
}

export interface IDevice {
  id: string;
  name: string;
  room?: string;
  states: { [prop: string]: string };
  attributes: { [prop: string]: string };
  traits: string[];
  deviceType: string;
  commands?: { [prop: string]: IDeviceCommand };
}

let base$: Observable<{ [id: string]: IDevice }>;
let save: (devices: { [id: string]: IDevice }) => Promise<void>;

export const getAllDevices$ = (): Observable<IDevice[]> => {
  return base$.pipe(map((x) => Object.values(x)));
};

export const getDeviceById$ = (id: string): Observable<IDevice | undefined> => {
  return getAllDevices$().pipe(map((x) => x.find((x) => x.id === id)));
};

export const updateDevice = async (id: string, device: IDevice) => {
  const currentDevice = await firstValueFrom(getDeviceById$(id));
  if (currentDevice) {
    // const d = { ...currentDevice, ...device };
    const all = await firstValueFrom(base$);
    all[id] = device;
    await save(all);
  } else {
    logging.error('updateDevice failed, device does not exist');
  }
};

export const createDevice = async (device: IDevice) => {
  const all = (await firstValueFrom(base$)) || {};
  device.id = device.id || uuidv4();
  all[device.id] = device;
  await save(all);
};

export const deleteDevice = async (id: string) => {
  const all = (await firstValueFrom(base$)) || {};
  delete all[id];
  await save(all);
};

export const importDevice = async (devices: { [id: string]: IDevice }) => {
  await save(devices);
};

export const init = (fileName: string) => {
  if (base$) {
    logging.warn('Devices already ready to run');
    return;
  }

  base$ = fileStore$(fileName).pipe(
    map((x) => {
      const d = x ? (JSON.parse(x) as { [id: string]: IDevice }) : {};
      logging.debug('file output', x, d);
      return d;
    }),
    shareReplay(1)
  );

  save = async (devices: { [id: string]: IDevice }) => {
    return writeToFile(fileName, JSON.stringify(devices));
  };

  firstValueFrom(base$).then((devices) => {
    logging.debug('Checking file', devices);
    if (!devices || Object.keys(devices).length === 0) {
      //   d1_mini_4: getDeviceClimate('d1_mini_4'),
      // d1_mini_3: getDeviceClimate('d1_mini_3'),
      // wroom_32_1: getDeviceClimate('wroom_32_1'),
      // dehumidifier: getDeviceDehumidifier(),

      const mockClimate = ['d1_mini_4', 'd1_mini_3', 'wroom_32_1'];
      const mockDehumidifier = ['dehumidifier'];

      mockClimate.forEach((x) => {
        const d: IDevice = {
          id: uuidv4(),
          name: x,
          states: getDeviceClimate(x),
          attributes: {},
          deviceType: 'action.devices.types.THERMOSTAT',
          traits: ['action.devices.traits.TemperatureSetting'],
        };
        createDevice(d);
      });

      mockDehumidifier.forEach((x) => {
        const d: IDevice = {
          id: uuidv4(),
          name: x,
          states: getDeviceDehumidifier(),
          attributes: {},
          deviceType: 'action.devices.types.DEHUMIDIFIER',
          traits: ['action.devices.traits.OnOff'],
        };
        createDevice(d);
      });

      // const d: IDevice = {
      //   id: uuidv4(),
      //   name: 'demo',
      //   states: {},
      //   attributes: {},
      //   deviceType: 'action.devices.types.SWITCH',
      //   traits: ['action.devices.traits.OnOff'],
      // };
      // createDevice(d);
    }
  });
};
