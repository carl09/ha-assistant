import { logging } from '@ha-assistant/listner';
import {
  SmartHomeV1ExecuteRequestPayload,
  SmartHomeV1ExecutePayload,
} from 'actions-on-google';

export const onExecute = (
  payload: SmartHomeV1ExecuteRequestPayload
): Promise<SmartHomeV1ExecutePayload> => {

  logging.log('onExecute', payload);
  // resolveValue

  return Promise.resolve({
    commands: [
      {
        ids: ['123'],
        status: 'SUCCESS',
        states: {
          on: true,
          online: true,
        },
      },
      {
        ids: ['456'],
        status: 'ERROR',
        errorCode: 'deviceTurnedOff',
      },
    ],
  });
};
