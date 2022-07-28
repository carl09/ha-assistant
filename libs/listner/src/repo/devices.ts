import { logging } from '../utils/logging';
import { firstValueFrom, map, Observable, shareReplay } from 'rxjs';
import { fileStore$, writeToFile } from './base';
import { v4 as uuidv4 } from 'uuid';

export type Device = {
  id: string;
  name: string;
  states: { [prop: string]: string };
  attributes: { [prop: string]: string };
  traits: string[];
  deviceType: string;
};

let base$: Observable<{ [id: string]: Device }>;
let save: (devices: { [id: string]: Device }) => Promise<void>;

export const getAllDevices$ = (): Observable<Device[]> => {
  return base$.pipe(map((x) => Object.values(x)));
};

export const getDeviceById$ = (id: string): Observable<Device | undefined> => {
  return getAllDevices$().pipe(map((x) => x.find((x) => x.id === id)));
};

export const updateDevice = async (id: string, device: Partial<Device>) => {
  const currentDevice = await firstValueFrom(getDeviceById$(id));
  if (currentDevice) {
    const d = { ...currentDevice, ...device };
    const all = await firstValueFrom(base$);
    all[id] = d;
    await save(all);
  } else {
    logging.error('updateDevice failed, device does not exist');
  }
};

export const createDevice = async (device: Device) => {
  const all = (await firstValueFrom(base$)) || {};
  logging.debug('All Devices', all);
  device.id = device.id || uuidv4();
  all[device.id] = device;
  await save(all);
};

export const init = (fileName: string) => {
  if (base$) {
    logging.warn('Devices already ready to run');
    return;
  }

  base$ = fileStore$(fileName).pipe(
    map((x) => {
      const d = x ? (JSON.parse(x) as { [id: string]: Device }) : {};
      logging.debug('file output', x, d);
      return d;
    }),
    shareReplay(1)
  );

  save = async (devices: { [id: string]: Device }) => {
    return writeToFile(fileName, JSON.stringify(devices));
  };

  firstValueFrom(base$).then((devices) => {
    logging.debug('Checking file', devices);
    if (!devices || Object.keys(devices).length === 0) {
      const d: Device = {
        id: uuidv4(),
        name: 'demo',
        states: {},
        attributes: {},
        deviceType: 'action.devices.types.SWITCH',
        traits: ['action.devices.traits.OnOff'],
      };
      createDevice(d);
    }
  });
};
