import { ChangeEvent, useEffect, useRef, useState } from 'react';
import {
  IServerConfig,
  logging,
  messages,
  IDevice,
} from '@ha-assistant/listner';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Devices } from './Devices/Devices';
import { useWindowDimensions } from './utils/useWindowDimensions';
import { Button } from './Components/Button';
import { GoogleActions } from './Google-Actions/Google-Actions';
import { mdiImport, mdiExport } from '@mdi/js';
import { Fake } from './Device-Edit/Input-Command';

const config: IServerConfig = (window as any).config || {};

logging.log('Starting Info', { config, location });

export const App = () => {
  const [devicesStatus, setDevicesStatus] = useState<{
    [key: string]: any;
  }>();

  const [devices, setDevices] = useState<IDevice[]>([]);

  const fileInput = useRef<HTMLInputElement>(null);

  const { width } = useWindowDimensions();

  const { lastJsonMessage, readyState } = useWebSocket(config.socketUrl, {
    shouldReconnect: () => {
      return true;
    },
    reconnectAttempts: 10,
    reconnectInterval: 3000,
  });

  useEffect(() => {
    if (lastJsonMessage !== null) {
      const msg = lastJsonMessage as messages;
      logging.log('msg', msg);
      if (msg.type === 'devices-status') {
        setDevicesStatus(msg.status);
      } else if (msg.type === 'devices') {
        setDevices(msg.devices);
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

  const onExport = () => {
    // fetch('api/export');
    window.open('api/export');
  };

  const onImport = (event: ChangeEvent<HTMLInputElement>) => {
    logging.debug('onImport', event);
    const file = event.target.files && event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const json = e.target?.result;
        fetch(`api/import`, {
          method: 'POST',
          body: json,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      };
      reader.readAsText(file);

      // const formData = new FormData();
      // formData.append('model', file);
      // fetch(`api/import`, {
      //   method: 'POST',
      //   body: formData,
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      // });
    }
  };

  const [v, setV] = useState<any>();

  return (
    <>
      <h1>
        {location.hostname} {width} {connectionStatus}
      </h1>
{/* 
      <Fake
        value={v}
        onChange={(x) => {
          console.log('onChange', x);
          setV(x);
        }}
      /> */}

      <Devices devices={devices} devicesStatus={devicesStatus} />

      <input
        type="file"
        style={{ display: 'none' }}
        ref={fileInput}
        onChange={(e) => onImport(e)}
      />

      <div className="form-actions mb-8">
        <Button
          icon={mdiImport}
          value="Import"
          onClick={() => fileInput.current?.click()}
        />
        <Button icon={mdiExport} value="Export" onClick={() => onExport()} />
      </div>

      <GoogleActions />
    </>
  );
};
