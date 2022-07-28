import dotenv from 'dotenv';
dotenv.config();
(global as any).WebSocket = require('ws');

import express from 'express';
import { apiInit } from './api-endpoints';
import { clientInit } from './client-endpoints';
import { getConfig } from './config';
import { webSocketInit } from './websocket-endpoint';
import * as http from 'http';

const cors = require('cors');

const app = express();

app.use(cors());

const config = getConfig();

clientInit(app, config);
apiInit(app);

const server = http.createServer(app);

webSocketInit(server);


server.listen(config.port, () => {
  console.log(`server started at http://localhost:${config.port}`);
});

const handle = (signal: number) => {
  console.log(`*^!@4=> Received event: ${signal}`);
};
process.on('SIGHUP', handle);
