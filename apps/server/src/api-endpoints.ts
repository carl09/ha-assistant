import { type Express } from 'express';
import { logging, createDevice, updateDevice, deleteDevice, IDevice } from '@ha-assistant/listner';

export const apiInit = (app: Express) => {
  app.get('/api', (req, res) => {
    res.send({
      name: 'hello',
    });
  });

  app.post('/api/device', (req, res) => {
    logging.log('Got body:', req.body);
    const device: IDevice = req.body;
    createDevice(device);
    res.sendStatus(201);
  });

  app.put('/api/device/:id', (req, res) => {
    var id = req.params.id;
    logging.log('Got body:', id, req.body);
    const device: IDevice = req.body;
    updateDevice(id, device);
    res.sendStatus(200);
  });

  app.delete('/api/device/:id', (req, res) => {
    var id = req.params.id;
    logging.log('Got delete:', id);
    deleteDevice(id);
    res.sendStatus(200);
  });
};
