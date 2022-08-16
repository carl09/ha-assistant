import { getDeviceById$, IDeviceCommand, logging } from '@ha-assistant/listner';
import {
  SmartHomeV1ExecuteRequestPayload,
  SmartHomeV1ExecutePayload,
  SmartHomeV1ExecuteResponseCommands
} from 'actions-on-google';
import { firstValueFrom } from 'rxjs';

export const onExecute = async (
  payload: SmartHomeV1ExecuteRequestPayload
): Promise<SmartHomeV1ExecutePayload> => {
  logging.log('onExecute', payload);
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

          logging.log('commands to run ', commandDetail);
        });
      }

      return d.id;
    });


    // const r: SmartHomeV1ExecuteResponseCommands = {
 
    // }

    return await Promise.all(deviceExecutions);
  });

  await Promise.all(c);

  // LOG: commands {
  //   devices: [ { id: '104c6816-c98c-4a6a-9ed3-4c2cc2bf9115' } ],
  //   execution: [ { command: 'action.devices.commands.OnOff', params: [Object] } ]
  // }

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
