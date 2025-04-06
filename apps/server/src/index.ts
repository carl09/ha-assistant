import dotenv from 'dotenv';
dotenv.config();
(global as any).WebSocket = require('ws');

import express from 'express';
import { apiInit } from './api-endpoints';
import { clientInit } from './client-endpoints';
import { getConfig } from './config';
import { webSocketInit } from './websocket-endpoint';
import * as http from 'http';
import * as https from 'https';
import { init, logging } from '@ha-assistant/listner';
import { authInit } from './auth-endpoints';
import { googleInit } from './google-endpoints';
import { lookupInit } from './lookup-endpoints';
import { existsSync, readFileSync } from 'fs';
import { initDeviceState } from './common';
import { googleLocalInit } from './google-local-endpoints';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');

const isDevelopment = process.env.NODE_ENV !== 'production';

// Create a trace exporter
const traceExporter = new OTLPTraceExporter({
  url: 'http://192.168.10.2:4318/v1/traces',
});

const sdk = new opentelemetry.NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: isDevelopment ? 'ha-assistant-dev' : 'ha-assistant',
  }),
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
});

// initialize the SDK and register with the OpenTelemetry API
// this enables the API to record telemetry
sdk.start();

// gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error: Error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});

logging.log('OpenTelemetry initialized with Jaeger exporter');

const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const config = getConfig();

init(config.deviceStore);
const deviceStats$ = initDeviceState();
clientInit(app, config);
apiInit(app);
lookupInit(app);
authInit(app);
googleInit(app, deviceStats$);
googleLocalInit(app, deviceStats$);

const server = http.createServer(app);

webSocketInit(server, deviceStats$);

app.use(function (req, res, next) {
  logging.debug('404', req.url, req.method);
  res.status(404).send('Unable to find the requested resource!');
});

server.listen(config.port, () => {
  logging.log(`server started at http://localhost:${config.port}`);
});

if (existsSync('/ssl/privkey.pem')) {
  https
    .createServer(
      {
        key: readFileSync('/ssl/privkey.pem'),
        cert: readFileSync('/ssl/fullchain.pem'),
      },
      app
    )
    .listen(config.securePort, () => {
      logging.log(`server started at https://localhost:${config.securePort}`);
    });
} else {
  logging.warn('cert dos not exist');
}

const handle = (signal: number) => {
  logging.error(`*^!@4=> Received event: ${signal}`);
};
process.on('SIGHUP', handle);
