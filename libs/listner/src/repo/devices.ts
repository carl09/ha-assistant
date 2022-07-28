import { lastValueFrom, map, Observable, shareReplay } from 'rxjs';
import { fileStore$, writeToFile } from './base';
export type Device = {
  id: string;
  name: string;
  states: { [prop: string]: string };
  attributes: { [prop: string]: string };
  traits: string[];
  deviceType: string;
};

let base$: Observable<{ [id: string]: Device }>;
let save: (devices: Device[]) => Promise<void>;

export const getAllDevices$ = (): Observable<Device[]> => {
  return base$.pipe(map((x) => Object.values(x)));
};

export const getDeviceById$ = (id: string): Observable<Device | undefined> => {
  return getAllDevices$().pipe(map((x) => x.find((x) => x.id === id)));
};

export const updateDevice = async (id: string, device: Partial<Device>) => {
  const currentDevice = await lastValueFrom(getDeviceById$(id));
  const d = { ...currentDevice, ...device };
  console.log('save ', d);
};

export const init = (fileName: string) => {
  if (base$) {
    console.warn('Devices already ready to run');
    return;
  }

  base$ = fileStore$(fileName).pipe(
    map((x) => {
      console.log('file output', x);
      return x ? (JSON.parse(x) as { [id: string]: Device }) : {};
    }),
    shareReplay(1)
  );

  save = async (devices: Device[]) => {
    writeToFile(fileName, JSON.stringify(devices));
  };

  lastValueFrom(getAllDevices$()).then((d) => {
    if (!d || d.length === 0) {
      console.log('ini data', d);
    }
  });
};
