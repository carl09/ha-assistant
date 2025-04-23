import { readFileSync, existsSync } from 'fs';
import { logInfo } from './logging.js';

const readFileAsJson = (filePath) => {
  logInfo('Reading File:', filePath);
  const rawdata = readFileSync(filePath);
  return JSON.parse(rawdata.toString());
};

const options = existsSync('/data/options.json')
  ? readFileAsJson('/data/options.json')
  : {
      message: process.env.MESSAGE,
      apiVersion: process.env.AZURE_OPENAI_VERSION,
      logins: [
        {
          endpoint: process.env.AZURE_OPENAI_RES1_ENDPOINT,
          apikey: process.env.AZURE_OPENAI_RES1_API_KEY,
          model: 'gpt-4o',
        },
      ],
    };

console.log('App options', options);

const port = process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 8099;

export const getConfig = () => {
  return {
    port: port,
    ...options,
  };
};
