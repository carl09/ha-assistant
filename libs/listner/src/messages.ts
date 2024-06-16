import { IDevice } from './repo/devices';

export type welcome = {
  type: 'welcome';
  value: string;
};

export type debug = {
  type: 'debug';
  value: string;
};

export type devices = {
  type: 'devices';
  devices: IDevice[];
  fromCache?: boolean;
};

export type devicesStatus = {
  type: 'devices-status';
  status: { [key: string]: any };
  fromCache?: boolean;
};

export type messages = welcome | debug | devices | devicesStatus;

