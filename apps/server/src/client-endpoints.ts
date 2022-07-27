import express from 'express';
import { type Express } from 'express';
import { IConfig } from './config';

export const clientInit = (app: Express, config: IConfig) => {
  app.use('/', express.static('public'));

  app.get('/config.js', (req, res) => {
    const clientConfig = {
      API: config.port,
      SOCKET: 123,
      INGRESS_URL: config.ingressUrl,
    };

    res.set('Content-Type', 'application/javascript');
    res.send(`window.config = ${JSON.stringify(clientConfig)}`);
  });
};
