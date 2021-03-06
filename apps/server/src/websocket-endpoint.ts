import { Device, getAllDevices$, messages } from '@ha-assistant/listner';
import {
  logging,
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

  let lastDevicesStatus: any;
  let lastDevices: Device[];

  const wss = new WebSocket.Server({
    path: '/ws',
    server,
  });

  const sendAll = (message: messages) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  };

  logging.debug('created socket server', wss.path);

  wss.on('connection', (ws) => {
    const send = (message: messages) => {
      ws.send(JSON.stringify(message));
    };

    send({ type: 'welcome', value: 'Hello' });

    if (lastDevicesStatus) {
      send({
        type: 'devices-status',
        status: lastDevicesStatus,
        fromCache: true,
      });
    }

    if (lastDevices) {
      send({
        type: 'devices',
        devices: lastDevices,
        fromCache: true,
      });
    }

    ws.on('message', (message) => {
      logging.log('from Client', message.toLocaleString());
      send({
        type: 'debug',
        value: 'There be gold in them thar hills.',
      });
    });

    ws.on('close', (e) => {
      logging.log('client gone', e);
    });
  });

  socket = getHomeAssistantDataAccess(
    config.homeAssistaneSocketUri,
    config.homeAssistaneApiKey
  );

  getDeviceStatusV2$(socket).subscribe({
    next: (d) => {
      lastDevicesStatus = d;
      sendAll({ type: 'devices-status', status: d });
    },
  });

  getAllDevices$().subscribe({
    next: (d) => {
      lastDevices = d;
      sendAll({ type: 'devices', devices: d });
    },
  });

  return wss;
};
