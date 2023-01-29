import {
  getDeviceById$,
  getHomeAssistantDataAccess,
  HomeAssistantDataAccess,
  logging,
  resolveValue,
} from '@ha-assistant/listner';
import {
  SmartHomeV1ExecuteRequestPayload,
  SmartHomeV1ExecutePayload,
  SmartHomeV1ExecuteResponseCommands,
} from 'actions-on-google';
import { firstValueFrom, Observable, take, lastValueFrom } from 'rxjs';
import { getConfig } from '../config';
import axios from 'axios';

const post = async <T>(
  url: string,
  token: string | undefined,
  body: { [key: string]: string }
) => {
  const var1 = JSON.stringify(body);

  console.log('post url:', url);
  console.log('post body:', var1);

  const res = await axios(url, {
    method: 'post',
    data: body,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data as T;
};

const callRemoteService = (
  domain: string,
  service: string,
  data: { [key: string]: string },
  token: string
) => {
  return post<{}>(
    `http://hassio/homeassistant/api/services/${domain}/${service}`,
    token,
    data
  );
};

export const onExecute = async (
  payload: SmartHomeV1ExecuteRequestPayload,
  deviceStats$: Observable<{
    [key: string]: any;
  }>,
  user: string
): Promise<SmartHomeV1ExecutePayload> => {
  logging.log('onExecute', payload);

  const config = getConfig();

  let socket: HomeAssistantDataAccess = getHomeAssistantDataAccess(
    config.homeAssistaneSocketUri,
    config.homeAssistaneApiKey
  );

  const c = payload.commands.map(async (x) => {
    logging.log('commands', x);

    const deviceExecutions = x.devices.map(async (d) => {
      const device = await firstValueFrom(getDeviceById$(d.id));

      if (device) {
        const executionResult = x.execution.map(async (exe) => {
          const [commandName] = exe.command.split('.').slice(-1);
          const commandDetail = (device.commands || {})[commandName];

          logging.info('commands to run ', commandDetail, exe.params);

          if (commandDetail) {
            const serviceCall = resolveValue<string>(commandDetail.command, {
              googleEvents: exe.params,
            });

            if (serviceCall) {
              const args = commandDetail.args
                ? (resolveValue<{}>(commandDetail.args, {
                    googleEvents: exe.params,
                  }) as { [key: string]: any })
                : {};

              const entityId =
                resolveValue<string>(commandDetail.target, {
                  googleEvents: exe.params,
                }) || '';

              logging.debug('commands serviceCall ', serviceCall);

              const [domain, service] = serviceCall.split('.');

              // const exeResuls = await lastValueFrom(
              //   socket.callService(domain, service, args, entityId);
              // );

              const exeResuls = (await callRemoteService(
                domain,
                service,
                { ...args, entityId: entityId },
                config.homeAssistaneApiKey
              )) as Record<string, any>;

              const deb = Object.keys(exeResuls || {}).reduce<Map<string, any>>(
                (acc, x) => {
                  if (x[0] !== '_') {
                    acc.set(x, exeResuls[x]);
                  }
                  return acc;
                },
                new Map()
              );

              logging.debug('exeResuls', deb);

              logging.debug('payload body', { ...args, entityId: entityId });

              if ('success' in exeResuls && exeResuls.success) {
                return {
                  code: 'SUCCESS',
                  id: d.id,
                };
              }
              return {
                code: 'deviceOffline',
                id: d.id,
              };
            } else {
              return {
                code: 'functionNotSupported',
                id: d.id,
              };
            }
          } else {
            return {
              code: 'functionNotSupported',
              id: d.id,
            };
          }
        });

        // return d.id;
        return Promise.all(executionResult);
      } else {
        return [
          {
            code: 'deviceNotFound',
            id: d.id,
          },
        ];
      }
    });

    const allResults = await Promise.all(deviceExecutions);
    return allResults.flat();
  });

  const results = (await Promise.all(c)).flat();

  // const statusMap = await lastValueFrom(deviceStats$.pipe(take(2)));

  // const statusMap = await lastValueFrom(deviceStats$.pipe(take(1)));

  //Promise<SmartHomeV1ExecuteResponseCommands[]>

  const googleResults = results.map(async (x) => {
    if (x.code === 'SUCCESS') {
      return {
        ids: [x.id],
        status: 'SUCCESS',
        // states: statusMap[x.id],
      };
    }
    return {
      ids: [x.id],
      status: 'ERROR',
      errorCode: x.code,
      // states: statusMap[x.id],
    };
  });

  const commands = (await Promise.all(
    googleResults
  )) as SmartHomeV1ExecuteResponseCommands[];

  logging.log('execute response to google', {
    commands: commands,
  });

  return {
    commands: commands,
  };
};
