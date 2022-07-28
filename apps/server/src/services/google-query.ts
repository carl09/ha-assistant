import {
  getDeviceStatusV2$,
  getHomeAssistantDataAccess,
  HomeAssistantDataAccess,
  logging,
} from '@ha-assistant/listner';
import {
  SmartHomeV1QueryPayload,
  SmartHomeV1QueryRequestPayload,
} from 'actions-on-google';
import { firstValueFrom } from 'rxjs';
import { getConfig } from '../config';

export const onQuery = async (
  payload: SmartHomeV1QueryRequestPayload
): Promise<SmartHomeV1QueryPayload> => {
  logging.debug('onQuery', payload);

  const config = getConfig();

  let socket: HomeAssistantDataAccess = getHomeAssistantDataAccess(
    config.homeAssistaneSocketUri,
    config.homeAssistaneApiKey
  );

  const ids = payload.devices.map((x) => x.id);

  const statusMap = await firstValueFrom(getDeviceStatusV2$(socket));

  return {
    devices: ids.reduce<{ [key: string]: any }>((acc, x) => {
      acc[x] = statusMap[x];
      return acc;
    }, {}),
  };

  //   return Promise.resolve({
  //     devices: {
  //       '123': {
  //         on: true,
  //         online: true,
  //       },
  //       '456': {
  //         on: true,
  //         online: true,
  //         brightness: 80,
  //         color: {
  //           name: 'cerulean',
  //           spectrumRGB: 31655,
  //         },
  //       },
  //     },
  //   });
};
