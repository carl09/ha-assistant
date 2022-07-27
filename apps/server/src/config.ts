import * as fs from 'fs';
import * as path from 'path';

export interface IConfig {
  port: number;
  ingressUrl?: string;
  homeAssistaneSocketUri: string;
  homeAssistaneApiKey: string;
}

const readFileAsJson = (filePath: string): any => {
  console.info('Reading File:', filePath);
  const rawdata = fs.readFileSync(filePath);
  return JSON.parse(rawdata.toString());
};

const options = fs.existsSync('/data/options.json')
  ? readFileAsJson('/data/options.json')
  : JSON.parse(process?.env?.options || '{}');

console.debug('App options', options);

const port = process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 4001;

Object.keys(process.env).forEach((x) => {
  console.log(`process.env.${x} = ${process.env[x]}`);
});

export const getConfig = (): IConfig => {
  return {
    port: port,
    ingressUrl: process.env.INGRESS_URL,
    homeAssistaneApiKey: process.env.HA_API_KEY || '',
    homeAssistaneSocketUri:
      process.env.HA_SOCKET_URL || 'ws://hassio/homeassistant/api/websocket',
  };
};
