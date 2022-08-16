import {
  getDeviceById$,
  getHomeAssistantDataAccess,
  HomeAssistantDataAccess,
  IDeviceCommand,
  logging,
  resolveValue,
} from '@ha-assistant/listner';
import {
  SmartHomeV1ExecuteRequestPayload,
  SmartHomeV1ExecutePayload,
  SmartHomeV1ExecuteResponseCommands,
} from 'actions-on-google';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { getConfig } from '../config';

export const onExecute = async (
  payload: SmartHomeV1ExecuteRequestPayload
): Promise<SmartHomeV1ExecutePayload> => {
  logging.log('onExecute', payload);

  const config = getConfig();

  let socket: HomeAssistantDataAccess = getHomeAssistantDataAccess(
    config.homeAssistaneSocketUri,
    config.homeAssistaneApiKey
  );
  // resolveValue

  // onExecute { commands: [ { devices: [Array], execution: [Array] } ] }

  const c = payload.commands.map(async (x) => {
    logging.log('commands', x);

    const deviceExecutions = x.devices.map(async (d) => {
      const device = await firstValueFrom(getDeviceById$(d.id));

      if (device) {
        x.execution.map(async (exe) => {
          const [commandName] = exe.command.split('.').slice(-1);
          const commandDetail = (device.commands || {})[commandName];

          logging.log('commands to run ', commandDetail, exe.params);

          if (commandDetail) {
            const serviceCall = resolveValue<string>(commandDetail.command, {
              googleEvents: exe.params,
            });

            const entityId = resolveValue<string>(commandDetail.target, {
              googleEvents: exe.params,
            });

            logging.log('commands serviceCall ', serviceCall);

            const [domain, service] = serviceCall.split('.');

            const exeResuls = await lastValueFrom(
              socket.callService(domain, service, {}, entityId)
            );

            console.log('exeResuls', exeResuls);
          }
        });
      }

      return d.id;
    });

    return Promise.all(deviceExecutions);
  });

  const results = (await Promise.all(c)).flat();

  const googleResults: SmartHomeV1ExecuteResponseCommands = {
    ids: results,
    status: 'SUCCESS',
  };

  return {
    commands: [googleResults],
  };
};
