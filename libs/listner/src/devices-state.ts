import {
  Observable,
  combineLatestWith,
  map,
  catchError,
  shareReplay,
} from 'rxjs';
import { getDevicesFromProps, resolveValue } from './devices-props';
import { HomeAssistantDataAccess } from './home-assistant-data-access';
import { getAllDevices$ } from './repo/devices';
import { logging } from './utils/logging';

interface IDeviceV2 {
  id: string;
  status: { [key: string]: any };
  subs: { [key: string]: any };
}

const getDeviceSubsV2 = (device: {
  [prop: string]: string;
}): { [key: string]: any } =>
  Object.keys(device).reduce<{ [key: string]: any }>((acc, x) => {
    const list = getDevicesFromProps(device[x]);

    if (list) {
      list.forEach((item) => {
        const key = `${item.domain}.${item.name}`;
        acc[key] = true;
      });
    }
    return acc;
  }, {});

export const getDeviceStatusV2$ = (socket: HomeAssistantDataAccess) =>
  new Observable<{ [key: string]: any }>((obs) => {
    let devicesState: { [key: string]: any } = {};
    const entitesState: { [key: string]: any } = {};

    const getDevices$: Observable<{
      devices: IDeviceV2[];
      allSubs: { [key: string]: any };
    }> = getAllDevices$().pipe(
      map((devices) => {
        return devices.map((device) => {
          const subs = getDeviceSubsV2(device.states);

          return {
            id: device.id,
            status: device.states,
            subs,
          };
        });
      }),
      map((deviceSubs) => {
        return {
          devices: deviceSubs,
          allSubs: deviceSubs.reduce<{ [key: string]: any }>((acc, i) => {
            acc = { ...(acc || {}), ...i.subs };
            return acc;
          }, {}),
        };
      })
    );

    const entityStatus$ = getDevices$
      .pipe(
        combineLatestWith(socket.getEntityStatus()),
        map(([devices, entites]) => {
          entites.forEach((x) => {
            if (!x || !x.entity_id) {
              logging.error('getEntityStatus() entites empty');
              return;
            }
            const [domain, name] = x.entity_id.split('.');
            entitesState[domain] = { ...(entitesState[domain] || {}) };
            entitesState[domain][name] = {
              state: x.state,
            };
            // TODO: Remove Attribute mapping
            Object.keys(x.attributes).forEach((a) => {
              entitesState[domain][name][a] = x.attributes[a];
            });
            entitesState[domain][name]['attributes'] = { ...x.attributes };
          });

          return devices.devices.reduce<{ [key: string]: any }>((acc, y) => {
            acc[y.id] = Object.keys(y.status).reduce<{ [key: string]: any }>(
              (acc2, i) => ({
                ...acc2,
                [i]: resolveValue(y.status[i], entitesState),
              }),
              {}
            );
            return acc;
          }, {});
        }),
        catchError((err, caught) => {
          logging.error('getEntityStatus()', err);
          return caught;
        })
      )
      .subscribe({
        next: (msg) => {
          devicesState = msg;
          obs.next(devicesState);
        },
      });

    const entityStatusUpdated$ = getDevices$
      .pipe(
        combineLatestWith(socket.getEntityStatusUpdated()),
        map(([devices, update]) => {
          let found = false;

          if (!update || update.entity_id === undefined) {
            return {
              found: false,
              devices: {},
            };
          }

          if (update.entity_id in devices.allSubs) {
            logging.debug(`got update for ${update.entity_id}`);
            found = true;

            const [domain, name] = update.entity_id.split('.');
            entitesState[domain] = { ...(entitesState[domain] || {}) };
            entitesState[domain][name] = {
              state: update.state,
            };
            // TODO: Remove Attribute mapping
            Object.keys(update.attributes).forEach((a) => {
              entitesState[domain][name][a] = update.attributes[a];
            });
            entitesState[domain][name]['attributes'] = { ...update.attributes };
          }

          let updatedDevices: { [key: string]: any } = {};

          if (found) {
            updatedDevices = devices.devices.reduce<{
              [key: string]: any;
            }>((acc, y) => {
              acc[y.id] = Object.keys(y.status).reduce<{
                [key: string]: any;
              }>(
                (acc2, i) => ({
                  ...acc2,
                  [i]: resolveValue(y.status[i], entitesState),
                }),
                {}
              );
              return acc;
            }, {});
          }

          return {
            devices: updatedDevices,
            found,
          };
        }),
        catchError((err, caught) => {
          logging.error('getEntityStatusUpdated()', err);
          return caught;
        })
      )
      .subscribe({
        next: (msg) => {
          if (msg.found) {
            if (JSON.stringify(devicesState) !== JSON.stringify(msg.devices)) {
              devicesState = msg.devices;
              obs.next(devicesState);
              logging.debug(`got update for`, devicesState);
            } else {
              logging.debug('Device state has not changed');
            }
          }
        },
      });

    return () => {
      console.warn('unsub');
      entityStatus$.unsubscribe();
      entityStatusUpdated$.unsubscribe();
    };
  }).pipe(shareReplay(1));
