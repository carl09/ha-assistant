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
import { firstValueFrom, Observable } from 'rxjs';
import { getConfig } from '../config';

export const onQuery = async (
  payload: SmartHomeV1QueryRequestPayload,
  deviceStats$: Observable<{
    [key: string]: any;
  }>
): Promise<SmartHomeV1QueryPayload> => {
  logging.info('onQuery', payload);

  const ids = payload.devices.map((x) => x.id);

  const statusMap = await firstValueFrom(deviceStats$);

  return {
    devices: ids.reduce<{ [key: string]: any }>((acc, id) => {
      acc[id] = { ...statusMap[id], status: 'SUCCESS' };
      return acc;
    }, {}),
  };
};
