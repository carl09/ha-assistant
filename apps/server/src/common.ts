import {
  getDeviceStatusV2$,
  getHomeAssistantDataAccess,
  HomeAssistantDataAccess,
} from '@ha-assistant/listner';
import { Observable, share, shareReplay } from 'rxjs';
import { getConfig } from './config';

let deviceStats$: Observable<{
  [key: string]: any;
}>;

export const initDeviceState = () => {
  const config = getConfig();

  let socket: HomeAssistantDataAccess = getHomeAssistantDataAccess(
    config.homeAssistaneSocketUri,
    config.homeAssistaneApiKey
  );

  deviceStats$ = getDeviceStatusV2$(socket).pipe(shareReplay(1));

  return deviceStats$;
};
