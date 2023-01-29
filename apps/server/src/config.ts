import { readFileSync, existsSync } from 'fs';
import { setLogLevel, logging } from '@ha-assistant/listner';

export interface IConfig {
  port: number;
  ingressUrl?: string;
  homeAssistaneSocketUri: string;
  homeAssistaneApiKey: string;
  supervisorToken: string;
  deviceStore: string;
  inferWebsocketUrl?: boolean;
  googleKeyFile?: string;
  googleAgentUserId: string;
}

export interface IOptions {
  dataStorePath?: string;
}

const readFileAsJson = (filePath: string): any => {
  logging.info('Reading File:', filePath);
  const rawdata = readFileSync(filePath);
  return JSON.parse(rawdata.toString());
};

const options = existsSync('/data/options.json')
  ? readFileAsJson('/data/options.json')
  : {
      logLevel: process.env.LOG_LEVEL,
      inferWebsocketUrl: process.env.INFER_WEBSOCKET_URL,
      googleKeyFile: process.env.GOOGLE_KEY_FILE,
      googleAgentUserId: process.env.GOOGLE_AGENT_USER_ID,
    };

logging.debug('App options', options);

setLogLevel(options.logLevel);

const port = process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 4001;

// Object.keys(process.env).forEach((x) => {
//   logging.debug(`process.env.${x} = ${process.env[x]}`);
// });

export const getConfig = (): IConfig => {
  return {
    port: port,
    ingressUrl: process.env.INGRESS_URL,
    homeAssistaneApiKey: process.env.HASSIO_TOKEN || '',
    supervisorToken: process.env.SUPERVISOR_TOKEN || '',
    homeAssistaneSocketUri:
      process.env.HA_SOCKET_URL || 'ws://hassio/homeassistant/api/websocket',

    deviceStore: process.env.DEVICE_STORE || '/data/devices.json',
    inferWebsocketUrl: options.inferWebsocketUrl,
    googleKeyFile:
      options.googleKeyFile && existsSync(options.googleKeyFile)
        ? options.googleKeyFile
        : undefined,
    googleAgentUserId: options.googleAgentUserId,
  };
};
