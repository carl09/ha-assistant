import { IServerConfig, logging } from '@ha-assistant/listner';
import express from 'express';
import { type Express } from 'express';
import { getConfig, IConfig } from './config';

export const clientInit = (app: Express, config: IConfig) => {
  app.use('/', express.static('public'));

  app.get('/config.js', (req, res) => {
    const config = getConfig();

    // logging.debug('Client', req.protocol, req.get('referer'), req.originalUrl);
    // logging.debug('config.js rawHeaders', req.rawHeaders);

    const host =
      process.env.NODE_ENV === 'development'
        ? `localhost:${config.port}`
        : req.get('host');

    const referer = req.get('referer') || '';
    const noRefererHost = `${req.protocol === 'http' ? 'ws' : 'wss'}://${host}${
      config.ingressUrl
    }ws`;
    const refererHost =
      referer.replace('https://', 'wss://').replace('http://', 'ws://') + 'ws';

    const clientConfig: IServerConfig = {
      port: config.port,
      ingressUrl: config.ingressUrl,
      socketUrl: config.inferWebsocketUrl ? noRefererHost : refererHost,
    };

    res.set('Content-Type', 'application/javascript');
    res.send(`window.config = ${JSON.stringify(clientConfig)}`);
  });
};
