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

type LookupItem = {
  label: string;
  detail: string;
  info?: string;
};

export const lookupInit = (app: Express) => {
  const config = getConfig();

  const socket = getHomeAssistantDataAccess(
    config.homeAssistaneSocketUri,
    config.homeAssistaneApiKey
  );

  app.get('/api/editor/builtin/functions', async (req, res) => {
    const lookupFunctions: LookupItem[] = [
      {
        label: 'equals',
        detail: 'compare to values',
      },
      {
        label: 'toInt',
        detail: 'converts string to int',
      },
      {
        label: 'toNum',
        detail: 'converts string to number',
        info: 'some really foon info to help me',
      },
    ];
    res.send(lookupFunctions);
  });

  app.get('/api/editor/entity/domains', async (req, res) => {
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
        res.send(
          Object.keys((entity || {})[a] || {}).map<LookupItem>((x) => {
            return {
              label: x,
              detail: `${typeof entity[a][x]} - ${entity[a][x]}`,
            };
          })
        );
      } else {
        res.send(
          Object.keys(entity || {}).map<LookupItem>((x) => {
            return {
              label: x,
              detail: `${typeof entity[x]} - ${entity[x]}`,
            };
          })
        );
      }
    } else {
      const entities = await firstValueFrom(socket.getEntities());
      const results = entities.reduce<LookupItem[]>((acc, i) => {
        if (i.entity_id.startsWith(domain)) {
          const [, d] = i.entity_id.split('.');
          const item: LookupItem = {
            label: d,
            detail: i.name,
          };
          return [...acc, item];
        }
        return acc;
      }, []);
      res.send(results);
    }
  });
};