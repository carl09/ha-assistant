(global as any).WebSocket = require('ws');
import dotenv from 'dotenv';
// import { webSocket } from 'rxjs/webSocket';
import express from 'express';

dotenv.config();

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
