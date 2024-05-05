import { type Express } from 'express';
import { getConfig } from './config';
import { createSocket } from 'node:dgram';
import { firstValueFrom } from 'rxjs';
import { getAllDevices$, logging } from '@ha-assistant/listner';
import {
  SmartHomeV1ExecuteRequestPayload,
  SmartHomeV1QueryRequestPayload,
} from 'actions-on-google';
import { onExecute } from './services/google-execute-v2';
import { onQuery } from './services/google-query';

interface IUDPOptions {
  udp_discovery_packet: string;
  device_id: string;
  device_model?: string;
  hardware_revision?: string;
  firmware_revision?: string;
  udp_discovery_port: number;
}

export const googleLocalInit = (app: Express) => {
  const config = getConfig();

  const devicesStatus$ = getAllDevices$()

  if (!config.localDiscoveryPacket) {
    logging.warn('Google Local Execution is disabled');
    return;
  }

  app.get('/api/local/reachableDevices', async (req, res) => {
    logging.debug('get /api/local/reachableDevices');
    const devices = await firstValueFrom(devicesStatus$);

    const resp = devices
      // .filter((x) => x.name === 'Coffee grinder')
      .map((x) => ({
        id: x.name.replaceAll(' ', '-'),
        localId: `local-${x.name.replaceAll(' ', '-')}`,
        deviceId: x.id,
      }));

    // logging.log('/api/local/reachableDevices', resp);

    res.send(resp);
  });

  app.post('/api/local/reachableDevices', async (req, res) => {
    logging.debug('post /api/local/reachableDevices');
    const devices = await firstValueFrom(devicesStatus$);

    const resp = devices
      // .filter((x) => x.name === 'Coffee grinder')
      .map((x) => ({
        id: x.name.replaceAll(' ', '-'),
        localId: `local-${x.name.replaceAll(' ', '-')}`,
        deviceId: x.id,
      }));

    // logging.log('post /api/local/reachableDevices', resp);

    res.send(resp);
  });

  app.post('/api/local/execute', async (req, res) => {
    logging.log('/api/local/execute', req.body);

    const payload: SmartHomeV1ExecuteRequestPayload = { commands: req.body };

    console.log('execute payload', JSON.stringify(payload));

    try {
      const result = await onExecute(payload, devicesStatus$, 'local');

      logging.log('execute result', result);

      res.send(result);
    } catch (err) {
      logging.error('onExecute', err);
      res.status(500).send(err);
    }
  });

  app.post('/api/local/query', async (req, res) => {
    logging.log('/api/local/query', req.body);

    try {
      const payload: SmartHomeV1QueryRequestPayload = {
        devices: req.body.devices,
      };

      const results = await onQuery(payload, devicesStatus$);

      logging.log('execute query', results);

      res.send(results);
    } catch (err) {
      logging.error('onQuery', err);
      res.status(500).send(err);
    }
  });

  const argv: IUDPOptions = {
    udp_discovery_port: config.udpPort,
    udp_discovery_packet: config.localDiscoveryPacket,
    device_id: 'ha-google-agent',
  };

  const socket = createSocket('udp4');
  socket.on('message', (msg, rinfo) => {
    const discoveryPacket = Buffer.from(argv.udp_discovery_packet, 'hex');
    if (msg.compare(discoveryPacket) !== 0) {
      logging.warn(`received unknown payload from ${rinfo}:`, msg);
      return;
    }

    const discoveryData = {
      id: argv.device_id,
      isLocalOnly: true,
      isProxy: true,
    };

    logging.debug(`received discovery Packet:`, {
      rinfo,
      discoveryData,
    });

    const responsePacket = JSON.stringify(discoveryData); // encode(discoveryData);
    socket.send(responsePacket, rinfo.port, rinfo.address, (error) => {
      if (error !== null) {
        logging.error('failed to send ack:', error);
        return;
      }
    });
  });
  socket
    .on('listening', () => {
      logging.warn('discovery listening', socket.address());
    })
    .bind(argv.udp_discovery_port);
};
