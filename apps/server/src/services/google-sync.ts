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

  const allDeviceStatus = allDeviceStatusArray.reduce<{[key: string]: any}>((acc, x) =>{
    const [domain, name] = x.entity_id.split('.');

    if (!(domain in acc)){
      acc[domain] = {}
    }

    acc[domain][name] = x;

    return acc;
  }, {})

  // console.log('allDevicestatus', allDeviceStatus);

  return Promise.resolve({
    agentUserId: config.googleAgentUserId,
    devices: devices.map<SmartHomeV1SyncDevices>((x) => {
      return {
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
          acc[key] = resolveValue(x.attributes[key], allDeviceStatus);
          return acc;
        }, {}),
        // deviceInfo: {
        //     manufacturer: 'HomeAssistant',
        //     model: '',
        //     hwVersion, '',
        //     swVersion: '',
        // }
      };
    }),
    // devices: [
    //   {
    //     id: '123',
    //     type: 'action.devices.types.OUTLET',
    //     traits: ['action.devices.traits.OnOff'],
    //     name: {
    //       defaultNames: ['My Outlet 1234'],
    //       name: 'Night light',
    //       nicknames: ['wall plug'],
    //     },
    //     willReportState: false,
    //     roomHint: 'kitchen',
    //     deviceInfo: {
    //       manufacturer: 'lights-out-inc',
    //       model: 'hs1234',
    //       hwVersion: '3.2',
    //       swVersion: '11.4',
    //     },
    //     otherDeviceIds: [
    //       {
    //         deviceId: 'local-device-id',
    //       },
    //     ],
    //     customData: {
    //       fooValue: 74,
    //       barValue: true,
    //       bazValue: 'foo',
    //     },
    //   },
    //   {
    //     id: '456',
    //     type: 'action.devices.types.LIGHT',
    //     traits: [
    //       'action.devices.traits.OnOff',
    //       'action.devices.traits.Brightness',
    //       'action.devices.traits.ColorSetting',
    //     ],
    //     name: {
    //       defaultNames: ['lights out inc. bulb A19 color hyperglow'],
    //       name: 'lamp1',
    //       nicknames: ['reading lamp'],
    //     },
    //     willReportState: false,
    //     roomHint: 'office',
    //     attributes: {
    //       colorModel: 'rgb',
    //       colorTemperatureRange: {
    //         temperatureMinK: 2000,
    //         temperatureMaxK: 9000,
    //       },
    //       commandOnlyColorSetting: false,
    //     },
    //     deviceInfo: {
    //       manufacturer: 'lights out inc.',
    //       model: 'hg11',
    //       hwVersion: '1.2',
    //       swVersion: '5.4',
    //     },
    //     customData: {
    //       fooValue: 12,
    //       barValue: false,
    //       bazValue: 'bar',
    //     },
    //   },
    // ],
  });
};
