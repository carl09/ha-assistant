import { readFileSync, existsSync } from 'fs';

const readFileAsJson = (filePath) => {
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
      localDiscoveryPacket: process.env.LOCAL_DISCOVERY_PACKET,
    };

console.log('App options', options);

const port = process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 8099;

export const getConfig = () => {
  return {
    port: port,
  };
};
