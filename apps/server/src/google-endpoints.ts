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

// https://developers.google.com/assistant/smarthome/develop/process-intents#disconnect-request

const getUser = (headers: Headers): Promise<string> => {
  const authorization = headers.authorization as string;
  const accessToken = (authorization || '').substr(7);
  return new Promise((res, rej) => {
    logging.info(`getUser ${accessToken}`);
    res(accessToken);
  });
};

export const googleInit = (app: Express) => {
  app.post('/api/fulfillment', async (req, res) => {
    // const user = await getUser(req.headers);
    const payload: SmartHomeV1Request = req.body;

    logging.debug('payload', payload);

    const results = payload.inputs.map(async (x) => {
      if (x.intent === 'action.devices.SYNC') {
        const sync = await onSync();
        return {
          requestId: payload.requestId,
          payload: sync,
        } as SmartHomeV1SyncResponse;
      } else if (x.intent === 'action.devices.QUERY') {
        const query = await onQuery(
          (x as SmartHomeV1QueryRequestInputs).payload
        );
        return {
          requestId: payload.requestId,
          payload: query,
        } as SmartHomeV1QueryResponse;
      } else if (x.intent === 'action.devices.EXECUTE') {
        const execute = await onExecute(
          (x as SmartHomeV1ExecuteRequestInputs).payload
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
    });
  });


};
