import { ChangeEvent, useRef, useState } from 'react';
import {
  IServerConfig,
  logging,
  IDevice,
} from '@ha-assistant/listner';
import { ReadyState } from 'react-use-websocket';
import { Devices } from './Devices/Devices';
import { useWindowDimensions } from './utils/useWindowDimensions';
import { Button } from './Components/Button';
import { GoogleActions } from './Google-Actions/Google-Actions';
import { mdiImport, mdiExport } from '@mdi/js';
import { DeviceEdit } from './Device-Edit/Device-Edit';

const config: IServerConfig = (window as any).config || {};

logging.log('Starting Info', { config, location });

export const App = () => {
  const fileInput = useRef<HTMLInputElement>(null);

  const [connectionStatus, setConnectionStatus] =
    useState<string>('Uninstantiated');

  const { width } = useWindowDimensions();
  const [device, setDevice] = useState<IDevice>();
  const [addNew, setAddNew] = useState<boolean>(false);

  // const connectionStatus = {
  //   [ReadyState.CONNECTING]: 'Connecting',
  //   [ReadyState.OPEN]: 'Open',
  //   [ReadyState.CLOSING]: 'Closing',
  //   [ReadyState.CLOSED]: 'Closed',
  //   [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  // }[readyState];

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
    }
  };

  const updateConnectionStatus = (readyState: ReadyState) => {
    const state = {
      [ReadyState.CONNECTING]: 'Connecting',
      [ReadyState.OPEN]: 'Open',
      [ReadyState.CLOSING]: 'Closing',
      [ReadyState.CLOSED]: 'Closed',
      [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];
    setConnectionStatus(state);
  };

  const clearSelected = () => {
    setDevice(undefined);
    setAddNew(false);
  };

  const isSmallScreen = width < 1000;
  const isEditing = device || addNew;
  const showList = !(isEditing && isSmallScreen);

  return (
    <>
      <h1>
        {location.hostname} {width} {connectionStatus}
      </h1>

      <div className="devices-list">
        {showList && (
          <div className="devices-list-row">
            {config.socketUrl && (
              <Devices
                socketUrl={config.socketUrl}
                onConnectionStatus={(e) => updateConnectionStatus(e)}
                onEditDevice={(d) => {
                  setDevice(d);
                  setAddNew(false);
                }}
                onNewDevice={() => {
                  setAddNew(true);
                  setDevice(undefined);
                }}
              />
            )}
          </div>
        )}
        {isEditing && (
          <div className="devices-list-row">
            <DeviceEdit device={device} onDone={() => clearSelected()} />
          </div>
        )}
      </div>

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
