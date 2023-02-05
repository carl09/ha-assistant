import { logging } from './../../../libs/listner/src/utils/logging';
import { encode } from 'cbor';
import { createSocket } from 'dgram';
import { type Express } from 'express';
import { getConfig } from './config';

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

  if (!config.localDiscoveryPacket) {
    return;
  }

  const argv: IUDPOptions = {
    udp_discovery_port: config.udpPort,
    udp_discovery_packet: config.localDiscoveryPacket,
    device_id: 'ha-google-agent',
  };

  const socket = createSocket('udp4');
  // Handle discovery request.
  socket.on('message', (msg, rinfo) => {
    const discoveryPacket = Buffer.from(argv.udp_discovery_packet, 'hex');
    if (msg.compare(discoveryPacket) !== 0) {
      logging.warn(`received unknown payload from ${rinfo}:`, msg);
      return;
    }

    logging.log('Recived message', msg, rinfo);

    const discoveryData = {
      id: argv.device_id,
      model: argv.device_model,
      hw_rev: argv.hardware_revision,
      fw_rev: argv.firmware_revision,
      isLocalOnly: true,
      isProxy: true,
    };
    const responsePacket = encode(discoveryData);
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
