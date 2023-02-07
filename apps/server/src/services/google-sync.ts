import { logging } from './../../../../libs/listner/src/utils/logging';
import { resolveValue } from './../../../../libs/listner/src/devices-props';
import {
  getAllDevices$,
  getHomeAssistantDataAccess,
  HomeAssistantDataAccess,
} from '@ha-assistant/listner';
import {
  SmartHomeV1SyncDevices,
  SmartHomeV1SyncPayload,
} from 'actions-on-google';
import { firstValueFrom } from 'rxjs';
import { getConfig } from '../config';

export const onSync = async (): Promise<SmartHomeV1SyncPayload> => {
  const config = getConfig();

  let socket: HomeAssistantDataAccess = getHomeAssistantDataAccess(
    config.homeAssistaneSocketUri,
    config.homeAssistaneApiKey
  );

  const devices = await firstValueFrom(getAllDevices$());
  const allDeviceStatusArray = await firstValueFrom(socket.getEntityStatus());

  const allDeviceStatus = allDeviceStatusArray.reduce<{ [key: string]: any }>(
    (acc, x) => {
      if (x && x.entity_id) {
        const [domain, name] = x.entity_id.split('.');

        if (!(domain in acc)) {
          acc[domain] = {};
        }

        acc[domain][name] = x;
      }

      return acc;
    },
    {}
  );

  return Promise.resolve({
    agentUserId: config.googleAgentUserId,
    devices: devices.map<SmartHomeV1SyncDevices>((x) => {
      const syncDevice: SmartHomeV1SyncDevices = {
        id: x.id,
        type: x.deviceType,
        traits: x.traits,
        name: {
          defaultNames: [x.name],
          name: x.name,
          nicknames: [x.name],
        },
        willReportState: !!config.googleKeyFile,
        roomHint: x.room,
        attributes: Object.keys(x.attributes || {}).reduce<{
          [key: string]: any;
        }>((acc, key) => {
          logging.debug(`${x.name} raw attributes`, key, x.attributes[key]);
          acc[key] = resolveValue(x.attributes[key], allDeviceStatus);
          logging.debug(`${x.name} attributes`, key, acc[key]);
          return acc;
        }, {}),
      };

      if (config.localDiscoveryPacket) {
        syncDevice.otherDeviceIds = [{ deviceId: `local_${x.id}` }];
        syncDevice.customData = {
          localEntityId: x.id,
          httpPort: config.port,
        };
      }

      return syncDevice;
    }),
  });
};
