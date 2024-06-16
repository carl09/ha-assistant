import { type Express } from 'express';
import {
  logging,
  createDevice,
  updateDevice,
  deleteDevice,
  IDevice,
  getHomeAssistantDataAccess,
  importDevice,
} from '@ha-assistant/listner';
import { getConfig } from './config';
import { firstValueFrom } from 'rxjs';
import { requestSync } from './google-endpoints';

export const apiInit = (app: Express) => {
  const config = getConfig();

  const socket = getHomeAssistantDataAccess(
    config.homeAssistaneSocketUri,
    config.homeAssistaneApiKey
  );

  app.post('/api/device', (req, res) => {
    logging.log('Got body:', req.body);
    const device: IDevice = req.body;
    createDevice(device);
    setTimeout(() => {
      requestSync();
    }, 500);
    res.sendStatus(201);
  });

  app.put('/api/device/:id', (req, res) => {
    var id = req.params.id;
    logging.log('Got body:', id, req.body);
    const device: IDevice = req.body;
    updateDevice(id, device);
    setTimeout(() => {
      requestSync();
    }, 500);
    res.sendStatus(200);
  });

  app.delete('/api/device/:id', (req, res) => {
    var id = req.params.id;
    logging.log('Got delete:', id);
    deleteDevice(id);
    setTimeout(() => {
      requestSync();
    }, 500);
    res.sendStatus(200);
  });

  app.get('/api/areas', async (req, res) => {
    logging.debug('areas');
    const rooms = await firstValueFrom(socket.getAreas());
    res.send(rooms);
  });

  app.get('/api/export', (req, res) => {
    res.download(config.deviceStore);
  });

  app.post('/api/import', async (req, res) => {
    logging.debug('body', req.body);

    const devices =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    await importDevice(devices);

    res.sendStatus(200);
  });
};
