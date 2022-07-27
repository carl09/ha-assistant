import {
  getHomeAssistantDataAccess,
  HomeAssistantDataAccess,
  getDeviceStatusV2$,
} from '@ha-assistant/listner';
import { Server } from 'http';
import WebSocket from 'ws';
import { getConfig } from './config';

let socket: HomeAssistantDataAccess;

export const webSocketInit = (server: Server) => {
  const config = getConfig();

  let lastDevices: any;

  const wss = new WebSocket.Server({
    path: '/ws',
    server,
  });

  console.log('created socket server', wss.path);

  wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'welcome', value: 'Hello' }));

    if (lastDevices) {
      ws.send(
        JSON.stringify({ type: 'devices', value: lastDevices, fromCache: true })
      );
    }

    ws.on('message', (message) => {
      console.log('from Client', message.toLocaleString());
      ws.send(
        JSON.stringify({
          type: 'debug',
          value: 'There be gold in them thar hills.',
        })
      );
    });

    ws.on('close', (e) => {
      console.log('client gone', e);
    });
  });

  socket = getHomeAssistantDataAccess(
    config.homeAssistaneSocketUri,
    config.homeAssistaneApiKey
  );

  const deviceStatus$ = getDeviceStatusV2$(socket).subscribe({
    next: (d) => {
      lastDevices = d;

      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'devices', value: d }));
        }
      });
    },
  });

  return wss;
};
