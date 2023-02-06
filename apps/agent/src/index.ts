/// <reference types="@google/local-home-sdk" />
// import { decodeFirst } from 'cbor';
// import { Buffer } from 'buffer';
import { version } from '../package.json';

if (!window.Buffer) {
  window.Buffer = Buffer;
}

import App = smarthome.App;
import IntentFlow = smarthome.IntentFlow;
import ErrorCode = IntentFlow.ErrorCode;
import Intents = smarthome.Intents;

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

const app = new App(version)
  .onIdentify(async (request) => {
    console.debug('IDENTIFY request:', request);

    const device = request.inputs[0].payload.device;

    console.log('device:', device);

    if (device.udpScanData === undefined) {
      throw Error(`identify request is missing discovery response: ${request}`);
    }
    // Raw discovery data are encoded as 'hex'.
    const udpScanData = Buffer.from(device.udpScanData.data, 'hex');
    console.log('udpScanData:', udpScanData);
    // Device encoded discovery payload in CBOR.
    const discoveryData: DiscoveryData = JSON.parse(device.udpScanData.data);
    // const discoveryData: DiscoveryData = await decodeFirst(udpScanData);
    // console.log('discoveryData:', discoveryData);

    const response: IntentFlow.IdentifyResponse = {
      intent: Intents.IDENTIFY,
      requestId: request.requestId,
      payload: {
        device: {
          id: device.id || 'deviceId',
          // type: 'action.devices.types.LIGHT',
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

    throw new IntentFlow.HandlerError(
      request.requestId,
      ErrorCode.INTENT_CANCELLED,
      'testing js'
    );

    return response;
  })
  .onExecute((request) => {
    console.debug('EXECUTE request', request);

    const response = new smarthome.Execute.Response.Builder().setRequestId(
      request.requestId
    );
    const command = request.inputs[0].payload.commands[0];

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
    console.log('Ready');
  });
