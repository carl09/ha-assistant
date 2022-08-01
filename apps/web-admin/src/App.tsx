import { useEffect, useState } from 'react';
import {
  IServerConfig,
  logging,
  messages,
  IDevice,
} from '@ha-assistant/listner';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Devices } from './Devices/Devices';
import { useWindowDimensions } from './utils/useWindowDimensions';
import { Editor } from './Editor/Editor';

const config: IServerConfig = (window as any).config || {};

console.log('window.config', config, location);

export const App = () => {
  const [devicesStatus, setDevicesStatus] = useState<{
    [key: string]: any;
  }>();

  const [devices, setDevices] = useState<IDevice[]>([]);

  const { width } = useWindowDimensions();

  const { lastJsonMessage, readyState } = useWebSocket<messages>(
    config.socketUrl,
    {
      shouldReconnect: (e) => {
        return true;
      },
      reconnectAttempts: 10,
      reconnectInterval: 3000,
    }
  );

  useEffect(() => {
    if (lastJsonMessage !== null) {
      logging.log('lastJsonMessage', lastJsonMessage);
      if (lastJsonMessage.type === 'devices-status') {
        setDevicesStatus(lastJsonMessage.status);
      } else if (lastJsonMessage.type === 'devices') {
        setDevices(lastJsonMessage.devices);
      }
    }
  }, [lastJsonMessage]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  return (
    <>
      <h1>
        {location.hostname} {width} {connectionStatus}
      </h1>

      <Editor />

      <Devices devices={devices} devicesStatus={devicesStatus} />
    </>
  );
};

