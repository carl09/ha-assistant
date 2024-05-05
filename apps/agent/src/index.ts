/// <reference types="@google/local-home-sdk" />
import { Buffer } from 'buffer';
import { version } from '../package.json';

import App = smarthome.App;
import IntentFlow = smarthome.IntentFlow;
import ErrorCode = IntentFlow.ErrorCode;
import Intents = smarthome.Intents;
import DataFlow = smarthome.DataFlow;
import Constants = smarthome.Constants;
import Execute = smarthome.Execute;

type DiscoveryData = {
  id: string;
  port: number;
  isLocalOnly?: boolean;
  isProxy?: boolean;
};

const app = new App(version);

app
  .onIdentify(async (request) => {
    console.debug('onIdentify request');
    const device = request.inputs[0].payload.device;

    if (device.udpScanData === undefined) {
      throw Error(`identify request is missing discovery response: ${request}`);
    }
    const udpScanData = Buffer.from(device.udpScanData.data, 'hex');
    const discoveryData: DiscoveryData = JSON.parse(udpScanData.toString());

    console.log('discoveryData:', discoveryData);

    const response: IntentFlow.IdentifyResponse = {
      intent: Intents.IDENTIFY,
      requestId: request.requestId,
      payload: {
        device: {
          id: discoveryData.id,
          isLocalOnly: discoveryData.isLocalOnly,
          isProxy: discoveryData.isProxy,
          // commandedOverProxy: true,
          deviceInfo: {
            hwVersion: 'UNKNOWN_HW_VERSION',
            manufacturer: 'Home Assistant',
            model: 'Home Assistant',
            swVersion: version,
          },
        },
      },
    };

    console.debug('IDENTIFY response', response);

    return response;
  })
  .onReachableDevices(async (request) => {
    console.debug('onReachableDevices request', request.requestId);
    const deviceManager = await app.getDeviceManager();

    // Reference to the local proxy device
    const proxyDeviceId = request.inputs[0].payload.device.id as string;

    console.debug('onReachableDevices proxyDeviceId', proxyDeviceId);

    const command = new DataFlow.HttpRequestData();
    command.protocol = Constants.Protocol.HTTP;
    command.method = Constants.HttpOperation.GET;
    command.requestId = request.requestId;
    command.deviceId = proxyDeviceId;
    command.port = 8089; // deviceData.httpPort;
    command.path = `/api/local/reachableDevices`;
    // command.data = JSON.stringify(this.request);
    command.dataType = 'application/json';
    command.additionalHeaders = {};

    try {
      let rawResponse = (await deviceManager.send(
        command
      )) as DataFlow.HttpResponseData;

      const serverDevices = JSON.parse(
        rawResponse.httpResponse.body as string
      ) as Array<{ id: string; localId: string; deviceId: string }>;

      console.debug('onReachableDevices serverDevices', serverDevices);

      const reachableDevices = serverDevices.map((x) => {
        return {
          verificationId: x.localId,
          // id: x.deviceId,
        };
      });

      console.debug('onReachableDevices devices', reachableDevices);
      console.debug(
        'onReachableDevices devices stringify',
        JSON.parse(JSON.stringify(reachableDevices))
      );

      const response: IntentFlow.ReachableDevicesResponse = {
        intent: Intents.REACHABLE_DEVICES,
        requestId: request.requestId,
        payload: {
          devices: reachableDevices,
        },
      };

      console.debug('onReachableDevices response', response);

      return response;
    } catch (err) {
      console.error('Error making request', err);
      // Errors coming out of `deviceManager.send` are already Google errors.
      throw err;
    }
  })
  .onQuery(async (request) => {
    console.debug('onQuery request');
    //: IntentFlow.QueryRequest

    const payload = request.inputs[0].payload;
    const devices = payload.devices;
    console.log('payload', payload);

    const deviceManager = await app.getDeviceManager();

    let devicesResults = {};
    // try {

    for (const device of devices) {
      const command = new DataFlow.HttpRequestData();
      command.protocol = Constants.Protocol.HTTP;
      command.method = Constants.HttpOperation.POST;
      command.requestId = request.requestId;
      command.deviceId = device.id;
      command.port = 8089; // deviceData.httpPort;
      command.path = `/api/local/query`;
      command.dataType = 'application/json';
      command.additionalHeaders = {};
      command.data = JSON.stringify({ devices: [device] });

      let rawResponse: DataFlow.HttpResponseData;

      try {
        rawResponse = (await deviceManager.send(
          command
        )) as DataFlow.HttpResponseData;

        console.log(
          'onQuery rawResponse',
          rawResponse.httpResponse.statusCode,
          rawResponse.httpResponse.body
        );

        devicesResults = {
          ...devicesResults,
          ...(rawResponse.httpResponse.body as any).devices,
        };
      } catch (err) {
        console.error('onQuery', err);
        throw err;
      }
    }

    console.log('onQuery result', JSON.parse(JSON.stringify(devicesResults)));

    const resp: IntentFlow.QueryResponse = {
      requestId: request.requestId,
      payload: {
        devices: devicesResults,
      },
    };

    return resp;
  })
  .onExecute(async (request) => {
    console.debug('onExecute request');
    console.debug('EXECUTE request', request);

    const response = new Execute.Response.Builder().setRequestId(
      request.requestId
    );

    const deviceManager = await app.getDeviceManager();

    // const proxyDeviceId = request.inputs[0].payload.device.id as string;

    const commands = request.inputs[0].payload.commands;

    const first_command = commands[0];

    const deviceId = first_command.devices[0].id;

    console.log('commands', commands, deviceId);

    const command = new DataFlow.HttpRequestData();
    command.protocol = Constants.Protocol.HTTP;
    command.method = Constants.HttpOperation.POST;
    command.requestId = request.requestId;
    command.deviceId = deviceId;
    command.port = 8089;
    command.path = `/api/local/execute`;
    command.data = JSON.stringify(commands);
    command.dataType = 'application/json';
    command.additionalHeaders = {};

    let rawResponse: DataFlow.HttpResponseData;

    try {
      rawResponse = (await deviceManager.send(
        command
      )) as DataFlow.HttpResponseData;
      console.debug('Request statusCode', rawResponse.httpResponse.statusCode);
      console.log('onExecute response', JSON.stringify(rawResponse));

      response.setSuccessState(first_command.devices[0].id, {});
    } catch (err) {
      console.error('Request Failed', err);
      response.setErrorState(
        first_command.devices[0].id,
        ErrorCode.GENERIC_ERROR
      );
    }

    console.log(
      'onExecute response stringify',
      JSON.parse(JSON.stringify(response.build()))
    );

    return response.build();
    // })
    // ).then(() => {
    //   console.debug('EXECUTE response', response);
    //   return response.build();
    // });
  })
  .listen()
  .then(() => {
    console.log('Ready to listen HA Agent', version);
  })
  .catch((e: Error) => console.error('App Error', e));
