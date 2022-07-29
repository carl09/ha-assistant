import { useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import {
  IServerConfig,
  logging,
  messages,
  IDevice,
} from '@ha-assistant/listner';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Devices } from './Devices';

const config: IServerConfig = (window as any).config || {};

console.log('window.config', config, location);

export const App = () => {
  const [devicesStatus, setDevicesStatus] = useState<{
    [key: string]: unknown;
  }>();

  const [devices, setDevices] = useState<IDevice[]>([]);

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
      <h1>{location.hostname}</h1>
      <span>The WebSocket is currently {connectionStatus}</span>

      <Devices devices={devices} />

      {devicesStatus
        ? Object.keys(devicesStatus).map((x) => (
            <div key={x}>
              <div>{x}</div>
              <div>
                {/* <pre>{JSON.stringify(devices[x], null, 2)}</pre> */}
                <CodeMirror
                  value={JSON.stringify(devicesStatus[x], null, 2)}
                  height="200px"
                  extensions={[json()]}
                />
              </div>
            </div>
          ))
        : ''}
    </>
  );
};

