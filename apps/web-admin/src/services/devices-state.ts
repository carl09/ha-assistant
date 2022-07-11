import { HomeAssistantDataAccess } from '@ha-assistant/listner';
import { Observable, combineLatestWith, map } from 'rxjs';
import { getDevicesV2$ } from './devices';
import { resolveValue } from './devices-props';

export const getDeviceStatusV2$ = (socket: HomeAssistantDataAccess) =>
  new Observable<{ [key: string]: any }>((obs) => {
    let devicesState: { [key: string]: any } = {};
    const entitesState: { [key: string]: any } = {};

    const entityStatus$ = getDevicesV2$
      .pipe(
        combineLatestWith(socket.getEntityStatus()),
        map(([devices, entites]) => {
          entites.forEach((x) => {
            const [domain, name] = x.entity_id.split('.');
            entitesState[domain] = { ...(entitesState[domain] || {}) };
            entitesState[domain][name] = {
              state: x.state,
            };
            Object.keys(x.attributes).forEach((a) => {
              entitesState[domain][name][a] = x.attributes[a];
            });
          });

          console.log('entitesState', entitesState);

          return devices.devices.reduce<{ [key: string]: any }>((acc, y) => {
            console.log('getDevices', y.subs);
            acc[y.name] = Object.keys(y.status).reduce<{ [key: string]: any }>(
              (acc2, i) => ({
                ...acc2,
                [i]: resolveValue(y.status[i], entitesState),
              }),
              {}
            );
            return acc;
          }, {});
        })
      )
      .subscribe({
        next: (msg) => {
          devicesState = msg;
          obs.next(devicesState);
        },
      });

    const entityStatusUpdated$ = getDevicesV2$
      .pipe(
        combineLatestWith(socket.getEntityStatusUpdated()),
        map(([devices, update]) => {
          // console.log('devices', devices);

          let found = false;

          if (update.entity_id in devices.allSubs) {
            console.warn('found', update);
            found = true;

            const [domain, name] = update.entity_id.split('.');
            entitesState[domain] = { ...(entitesState[domain] || {}) };
            entitesState[domain][name] = {
              state: update.state,
            };
            Object.keys(update.attributes).forEach((a) => {
              entitesState[domain][name][a] = update.attributes[a];
            });
          }

          let updatedDevices: { [key: string]: any } = {};

          if (found) {
            updatedDevices = devices.devices.reduce<{
              [key: string]: any;
            }>((acc, y) => {
              console.log('getDevices', y.subs);
              acc[y.name] = Object.keys(y.status).reduce<{
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
        })
      )
      .subscribe({
        next: (msg) => {
          if (msg.found) {
            devicesState = msg.devices;
            obs.next(devicesState);
          }
          //   console.log('entityStatusUpdated$', msg);
        },
      });

    // const entityStatusUpdated = getEntityStatusUpdated$(socket).subscribe({
    //   next: (msg) => {
    //     if (msg && Object.keys(msg).length !== 0) {
    //       console.log('per getEntityStatusUpdated', msg);
    //       const foo = Object.keys(devices).reduce<{ [key: string]: any }>(
    //         (acc, x) => {
    //           if (x in msg) {
    //             acc[x] = { ...devices[x], ...msg[x] };
    //           } else {
    //             acc[x] = { ...devices[x] };
    //           }
    //           return acc;
    //         },
    //         {}
    //       );

    //       devices = foo;
    //       obs.next(devices);
    //     }
    //   },
    // });

    return () => {
      console.warn('unsub');
      entityStatus$.unsubscribe();
      entityStatusUpdated$.unsubscribe();
    };
  });
