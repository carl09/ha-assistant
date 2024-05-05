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
      'X-Ha-Access': token,

      'X-WEBAUTH-USER': 'b63c4564a0514a899821d85e2e18d8db',
      'X-Hass-User-ID': 'b63c4564a0514a899821d85e2e18d8db',
      'X-Hass-Is-Admin': 1,
    },
  });

  return res.data as T;
};

const callRemoteService = (
  host: string,
  domain: string,
  service: string,
  data: { [key: string]: string },
  token: string
) => {
  return post<{}>(`${host}/services/${domain}/${service}`, token, data);
};

const executeCommand = async (command, device, config) => {
  const deviceExecutions = command.devices.map(async (device) => {
    const device = await firstValueFrom(getDeviceById$(device.id));

    if (!device) {
      return {
        code: 'deviceNotFound',
        id: device.id,
      };
    }

    const executionResult = command.execution.map((execution) =>
      executeDeviceCommand(execution, device, config)
    );

    return Promise.all(executionResult);
  });

  return Promise.all(deviceExecutions);
};

const executeDeviceCommand = async (execution, device, config) => {
  const [commandName] = execution.command.split('.').slice(-1);
  const commandDetail = (device.commands || {})[commandName];

  logging.info('commands to run ', commandDetail, execution.params);

  if (!commandDetail) {
    return {
      code: 'functionNotSupported',
      id: device.id,
    };
  }

  const serviceCall = resolveValue<string>(commandDetail.command, {
    googleEvents: execution.params,
  });

  if (!serviceCall) {
    return {
      code: 'functionNotSupported',
      id: device.id,
    };
  }

  const args = commandDetail.args
    ? (resolveValue<{}>(commandDetail.args, {
        googleEvents: execution.params,
      }) as { [key: string]: any })
    : {};

  const entityId =
    resolveValue<string>(commandDetail.target, {
      googleEvents: execution.params,
    }) || '';

  logging.debug('commands serviceCall ', serviceCall);

  const [domain, service] = serviceCall.split('.');

  try {
    const executionResults = (await callRemoteService(
      config.homeAssistaneRestUri,
      domain,
      service,
      { ...args, entity_id: entityId },
      config.homeAssistaneApiKey
    )) as Record<string, any>;
    logging.debug('Http Resp', executionResults);

    return {
      code: 'SUCCESS',
      id: device.id,
    };
  } catch (err) {
    logging.error('http failed:', err);

    return {
      code: 'deviceOffline',
      id: device.id,
    };
  }
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

  const commandResults = payload.commands.map((command) =>
    executeCommand(command, device, config)
  );

  const results = (await Promise.all(commandResults)).flat();

  const statusMap = await lastValueFrom(deviceStats$.pipe(take(1)));

  const googleResults = results.map(async (result) => {
    console.log('statusMap[result.id]', statusMap[result.id]);
    if (result.code === 'SUCCESS') {
      return {
        ids: [result.id],
        status: 'SUCCESS',
        states: statusMap[result.id],
      };
    }
    return {
      ids: [result.id],
      status: 'ERROR',
      errorCode: result.code,
      states: statusMap[result.id],
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
const executeCommand = async (command, device, config) => {
  const deviceExecutions = command.devices.map(async (device) => {
    const device = await firstValueFrom(getDeviceById$(device.id));

    if (!device) {
      return {
        code: 'deviceNotFound',
        id: device.id,
      };
    }

    const executionResult = command.execution.map((execution) =>
      executeDeviceCommand(execution, device, config)
    );

    return Promise.all(executionResult);
  });

  return Promise.all(deviceExecutions);
};

const executeDeviceCommand = async (execution, device, config) => {
  const [commandName] = execution.command.split('.').slice(-1);
  const commandDetail = (device.commands || {})[commandName];

  logging.info('commands to run ', commandDetail, execution.params);

  if (!commandDetail) {
    return {
      code: 'functionNotSupported',
      id: device.id,
    };
  }

  const serviceCall = resolveValue<string>(commandDetail.command, {
    googleEvents: execution.params,
  });

  if (!serviceCall) {
    return {
      code: 'functionNotSupported',
      id: device.id,
    };
  }

  const args = commandDetail.args
    ? (resolveValue<{}>(commandDetail.args, {
        googleEvents: execution.params,
      }) as { [key: string]: any })
    : {};

  const entityId =
    resolveValue<string>(commandDetail.target, {
      googleEvents: execution.params,
    }) || '';

  logging.debug('commands serviceCall ', serviceCall);

  const [domain, service] = serviceCall.split('.');

  try {
    const executionResults = (await callRemoteService(
      config.homeAssistaneRestUri,
      domain,
      service,
      { ...args, entity_id: entityId },
      config.homeAssistaneApiKey
    )) as Record<string, any>;
    logging.debug('Http Resp', executionResults);

    return {
      code: 'SUCCESS',
      id: device.id,
    };
  } catch (err) {
    logging.error('http failed:', err);

    return {
      code: 'deviceOffline',
      id: device.id,
    };
  }
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

  const commandResults = payload.commands.map((command) =>
    executeCommand(command, device, config)
  );

  const results = (await Promise.all(commandResults)).flat();

  const statusMap = await lastValueFrom(deviceStats$.pipe(take(1)));

  const googleResults = results.map(async (result) => {
    console.log('statusMap[result.id]', statusMap[result.id]);
    if (result.code === 'SUCCESS') {
      return {
        ids: [result.id],
        status: 'SUCCESS',
        states: statusMap[result.id],
      };
    }
    return {
      ids: [result.id],
      status: 'ERROR',
      errorCode: result.code,
      states: statusMap[result.id],
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
