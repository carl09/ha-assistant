import { type Express } from 'express';
import { logging } from '@ha-assistant/listner';
import {
  SmartHomeV1Request,
  SmartHomeV1SyncResponse,
  SmartHomeV1QueryRequestInputs,
  SmartHomeV1QueryResponse,
  SmartHomeV1ExecuteResponse,
  SmartHomeV1ExecuteRequestInputs,
  Headers,
} from 'actions-on-google';
import { onSync } from './services/google-sync';
import { onQuery } from './services/google-query';
import { onDisconnect } from './services/google-disconnect';
import { onExecute } from './services/google-execute';
import { getConfig } from './config';
import { Observable, tap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { google } from 'googleapis';

const getUser = (headers: Headers): Promise<string> => {
  const authorization = headers.authorization as string;
  const accessToken = (authorization || '').substr(7);
  return new Promise((res, rej) => {
    logging.info(`getUser ${accessToken}`);
    res(accessToken);
  });
};

export const requestSync = async () => {
  const config = getConfig();

  if (!config.googleKeyFile) {
    return;
  }

  const homegraphClient = google.homegraph({
    version: 'v1',
    auth: new google.auth.GoogleAuth({
      keyFile: config.googleKeyFile,
      scopes: 'https://www.googleapis.com/auth/homegraph',
    }),
  });

  try {
    const res = await homegraphClient.devices.requestSync({
      requestBody: {
        agentUserId: config.googleAgentUserId,
        async: false,
      },
    });
    logging.log('requestSync res done');
  } catch (err) {
    logging.error('requestSync', err);
  }
};

const reportState = async (updates: { [key: string]: any }) => {
  const config = getConfig();

  if (!config.googleKeyFile) {
    return;
  }

  logging.debug('reportState', updates);

  const homegraphClient = google.homegraph({
    version: 'v1',
    auth: new google.auth.GoogleAuth({
      keyFile: config.googleKeyFile,
      scopes: 'https://www.googleapis.com/auth/homegraph',
    }),
  });

  try {
    const res = await homegraphClient.devices.reportStateAndNotification({
      requestBody: {
        agentUserId: config.googleAgentUserId,
        requestId: uuidv4(),
        payload: {
          devices: {
            states: updates,
          },
        },
      },
    });

    logging.debug('reportState res done');
  } catch (err: any) {
    logging.error(`reportState ${err.code} : ${err.message}`, {
      requestBody: {
        agentUserId: config.googleAgentUserId,
        requestId: uuidv4(),
        payload: {
          devices: {
            states: updates,
          },
        },
      },
    });
  }
};

export const googleInit = (
  app: Express,
  deviceStats$: Observable<{
    [key: string]: any;
  }>
) => {
  const config = getConfig();

  logging.debug('googleKeyFile', config.googleKeyFile);
  if (config.googleKeyFile) {
    let lastDevicesStatus: any;

    deviceStats$
      .pipe(
        tap((newDevicesStatus) => {
          if (lastDevicesStatus) {
            const changes: any = {};

            Object.keys(newDevicesStatus).forEach((key) => {
              // console.log('Chacking for changes', key);
              if (
                JSON.stringify(newDevicesStatus[key]) !==
                JSON.stringify(lastDevicesStatus[key])
              ) {
                changes[key] = newDevicesStatus[key];
              }
            });

            if (Object.keys(changes).length !== 0) {
              reportState(changes);
            }
          }
        })
      )
      .subscribe({
        next: (d) => {
          lastDevicesStatus = d;
        },
      });
  }

  app.post('/api/fulfillment', async (req, res) => {
    const user = await getUser(req.headers);

    const payload: SmartHomeV1Request = req.body;

    logging.debug('fulfillment payload', payload);

    const results = payload.inputs.map(async (x) => {
      if (x.intent === 'action.devices.SYNC') {
        const sync = await onSync();

        logging.info('action.devices.SYNC payload', sync);

        return {
          requestId: payload.requestId,
          payload: sync,
        } as SmartHomeV1SyncResponse;
      } else if (x.intent === 'action.devices.QUERY') {
        const query = await onQuery(
          (x as SmartHomeV1QueryRequestInputs).payload,
          deviceStats$
        );

        logging.info('action.devices.QUERY payload', query);
        return {
          requestId: payload.requestId,
          payload: query,
        } as SmartHomeV1QueryResponse;
      } else if (x.intent === 'action.devices.EXECUTE') {
        const execute = await onExecute(
          (x as SmartHomeV1ExecuteRequestInputs).payload,
          deviceStats$,
          user
        );
        return {
          requestId: payload.requestId,
          payload: execute,
        } as SmartHomeV1ExecuteResponse;
      } else if (x.intent === 'action.devices.DISCONNECT') {
        return await onDisconnect();
      }
    });

    Promise.all(results).then((x) => {
      return res.send(x[0]);
    }).catch(err => {
      logging.error('fulfillment', err)
    });
  });
};
