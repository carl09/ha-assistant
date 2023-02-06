/// <reference types="@google/local-home-sdk" />
import { Buffer } from 'buffer';
import { version } from '../package.json';

import App = smarthome.App;
import IntentFlow = smarthome.IntentFlow;
import ErrorCode = IntentFlow.ErrorCode;
import Intents = smarthome.Intents;
import DataFlow = smarthome.DataFlow;
import Constants = smarthome.Constants;

type DiscoveryData = {
  id: string;
  model: string;
  hw_rev: string;
  fw_rev: string;
  leds: number;
  port: number;
  isLocalOnly?: boolean;
  isProxy?: boolean;
};

const app = new App(version);

app
  .onIdentify(async (request) => {
    console.debug('IDENTIFY request:', request);

    const device = request.inputs[0].payload.device;

    console.log('device:', device);

    if (device.udpScanData === undefined) {
      throw Error(`identify request is missing discovery response: ${request}`);
    }
    // Raw discovery data are encoded as 'hex'.
    const udpScanData = Buffer.from(device.udpScanData.data, 'hex');
    const discoveryData: DiscoveryData = JSON.parse(udpScanData.toString());

    console.log('discoveryData:', discoveryData);

    const response: IntentFlow.IdentifyResponse = {
      intent: Intents.IDENTIFY,
      requestId: request.requestId,
      payload: {
        device: {
          id: discoveryData.id,
          verificationId: discoveryData.isLocalOnly
            ? undefined
            : discoveryData.id,
          isLocalOnly: discoveryData.isLocalOnly,
          isProxy: discoveryData.isProxy,
          commandedOverProxy: true,
        },
      },
    };

    console.debug('IDENTIFY response', response);

    // throw new IntentFlow.HandlerError(
    //   request.requestId,
    //   ErrorCode.INTENT_CANCELLED,
    //   'testing js'
    // );

    return response;
  })
  .onReachableDevices(async (request) => {
    const deviceManager = await app.getDeviceManager();

    // Reference to the local proxy device
    const proxyDeviceId = request.inputs[0].payload.device.id as string;

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

    // this.logMessage("Sending", command);

    let rawResponse: DataFlow.HttpResponseData;

    const reachableDevices: Array<
      IntentFlow.DeviceWithId | IntentFlow.DeviceWithVerificationId
    > = [];

    try {
      rawResponse = (await deviceManager.send(
        command
      )) as DataFlow.HttpResponseData;

      console.log('rawResponse', rawResponse);

      const deveices = JSON.parse(
        rawResponse.httpResponse.body as string
      ) as Array<{ id: string }>;

      (deveices || []).forEach((x) => {
        reachableDevices.push({
          verificationId: `local_${x.id}`,
          id: x.id,
        });
      });

      console.log('rawResponse', deveices);
    } catch (err) {
      console.error('Error making request', err);
      // Errors coming out of `deviceManager.send` are already Google errors.
      throw err;
    }

    // const reachableDevices = [
    //   // Each verificationId must match one of the otherDeviceIds
    //   // in the SYNC response
    //   { verificationId: 'local-device-id-1' },
    //   { verificationId: 'local-device-id-2' },
    // ];

    // Return a response
    const response: IntentFlow.ReachableDevicesResponse = {
      intent: Intents.REACHABLE_DEVICES,
      requestId: request.requestId,
      payload: {
        devices: reachableDevices,
      },
    };

    // throw new IntentFlow.HandlerError(
    //   request.requestId,
    //   ErrorCode.INTENT_CANCELLED,
    //   'testing js'
    // );

    return response;
  })
  .onExecute((request) => {
    console.debug('EXECUTE request', request);

    const response = new smarthome.Execute.Response.Builder().setRequestId(
      request.requestId
    );
    const command = request.inputs[0].payload.commands[0];

    
    console.log('command', command);

    throw new Error('failed');

    return Promise.all(
      command.devices.map((device) => {
        // TODO: send device command.
        // TODO: set response success/errorState.
      })
    ).then(() => {
      console.debug('EXECUTE response', response);
      return response.build();
    });
  })
  .listen()
  .then(() => {
    console.log('Ready to listen');
  });
