(global as any).WebSocket = require('ws');
import dotenv from 'dotenv';
import express from 'express';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

export const readFileAsJson = (filePath: string): any => {
  console.info('Reading File:', filePath);
  const rawdata = fs.readFileSync(filePath);
  return JSON.parse(rawdata.toString());
};

const options = process.env.NODE_ENV === 'production'
  ? readFileAsJson('/data/options.json')
  : JSON.parse(process?.env?.options || '{}');

console.debug('App options', options);

const port = process.env.SERVER_PORT || 4001;

Object.keys(process.env).forEach((x) => {
  console.log(`process.env.${x} = ${process.env[x]}`);
});

const app = express();

app.use('/', express.static('public'));

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`);
});

const handle = (signal: number) => {
  console.log(`*^!@4=> Received event: ${signal}`);
};
process.on('SIGHUP', handle);
