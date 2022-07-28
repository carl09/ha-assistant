import { IServerConfig } from '@ha-assistant/listner';
import express from 'express';
import { type Express } from 'express';
import { IConfig } from './config';

export const clientInit = (app: Express, config: IConfig) => {
  app.use('/', express.static('public'));

  app.get('/config.js', (req, res) => {
    console.log('Client', req.protocol, req.get('host'), req.originalUrl);

    const host =
      process.env.NODE_ENV === 'development'
        ? `localhost:${config.port}`
        : req.get('host');

    const socketUrl = `${req.protocol === 'http' ? 'ws' : 'wss'}://${host}${
      config.ingressUrl
    }ws`;

    const clientConfig: IServerConfig = {
      port: config.port,
      ingressUrl: config.ingressUrl,
      socketUrl,
    };

    res.set('Content-Type', 'application/javascript');
    res.send(`window.config = ${JSON.stringify(clientConfig)}`);
  });
};
