import { type Express } from 'express';
import {
  logging,
  createDevice,
  updateDevice,
  deleteDevice,
  IDevice,
  getHomeAssistantDataAccess,
} from '@ha-assistant/listner';
import { getConfig } from './config';
import { firstValueFrom } from 'rxjs';

type LookupItem = {
  label: string;
  detail: string;
  info?: string
};

export const apiInit = (app: Express) => {
  const config = getConfig();

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

  const socket = getHomeAssistantDataAccess(
    config.homeAssistaneSocketUri,
    config.homeAssistaneApiKey
  );

  app.get('/api/editor/lookup', async (req, res) => {
    const entities = await firstValueFrom(socket.getEntities());
    const s = entities.reduce<{ [key: string]: boolean }>((acc, i) => {
      if (i.entity_id) {
        const [d] = i.entity_id.split('.');
        acc[d] = true;
      }
      return acc;
    }, {});
    const results = Object.keys(s);
    res.send(results);
  });

  app.get('/api/editor/lookup/:domain', async (req, res) => {
    var domain = req.params.domain;
    logging.log('Got lookup domain:', domain);

    const [d, n, a] = domain.split('.');

    logging.debug(`lookup d:${d} - n:${n} - a:${a}`);

    if (d && n) {
      const entities = await firstValueFrom(socket.getEntityStatus());
      const entity = entities.find((x) => x.entity_id === `${d}.${n}`) as any;
      logging.debug('found enity', entity);
      if (a) {
        res.send(Object.keys((entity || {})[a] || {}).map<LookupItem>(x => {
          return {
            label: x,
            detail: `${typeof entity[a][x]} - ${entity[a][x]}`
          }
        }) );
      } else {
        res.send(Object.keys(entity || {}).map<LookupItem>(x => {
          return {
            label: x,
            detail: `${typeof entity[x]} - ${entity[x]}`
          }
        }) );
      }
    } else {
      const entities = await firstValueFrom(socket.getEntities());
      const results = entities.reduce<LookupItem[]>((acc, i) => {
        if (i.entity_id.startsWith(domain)) {
          const [, d] = i.entity_id.split('.');
          const item: LookupItem = {
            label: d,
            detail: i.name
          }
          return [...acc, item];
        }
        return acc;
      }, []);
      res.send(results);
    }
  });
};
