import { IDevice, logging, messages } from '@ha-assistant/listner';
import { useEffect, useState } from 'react';
import { DeviceEdit } from '../Device-Edit/Device-Edit';
import './Devices.scss';
import { useWindowDimensions } from '../utils/useWindowDimensions';
import { DeviceSummary } from './Device-Summary';
import { mdiPlusCircleOutline } from '@mdi/js';
import { Button } from '../Components/Button';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Dialog } from '../Components/Dialog';
import { DeviceExecution } from './Device-Execution';

type DevicesProps = {
  socketUrl: string;
  // devices?: IDevice[];
  // devicesStatus?: { [key: string]: any };
  onEditDevice: (device: IDevice) => void;
  onNewDevice: () => void;
  onConnectionStatus: (state: ReadyState) => void;
};
export const Devices = ({
  socketUrl,
  onEditDevice,
  onNewDevice,
  onConnectionStatus,
}: DevicesProps) => {
  const { lastJsonMessage, readyState } = useWebSocket(socketUrl, {
    shouldReconnect: () => {
      return true;
    },
    reconnectAttempts: 10,
    reconnectInterval: 3000,
  });

  const [devicesStatus, setDevicesStatus] = useState<{
    [key: string]: any;
  }>();

  const [devices, setDevices] = useState<IDevice[]>([]);

  const [executionDevice, setExecutionDevice] = useState<IDevice>();

  const [data, setData] = useState<any>();

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

  useEffect(() => {
    onConnectionStatus && onConnectionStatus(readyState);
  }, [readyState]);

  const selectDevice = (d: IDevice) => {
    logging.log(`selected ${d.name}`);
    onEditDevice && onEditDevice(d);
  };

  const addNewDevice = () => {
    onNewDevice && onNewDevice();
  };

  const showExecution = (id: string) => {
    const device = devices.find((x) => x.id === id);
    console.warn('showExecution', device);
    setExecutionDevice(device);
  };

  // const isSmallScreen = width < 1000;
  // const isEditing = device || addNew;
  // const showList = !(isEditing && isSmallScreen);

  return (
    <>
      <div className="devices-list">
        <div className="devices-list-row">
          <Button
            onClick={() => addNewDevice()}
            icon={mdiPlusCircleOutline}
            value="Add New"
          />
          <div className="device-grid">
            {(devices || []).map((x) => {
              return (
                <div className="device-grid-item" key={x.id}>
                  <DeviceSummary
                    device={x}
                    deviceStats={devicesStatus && devicesStatus[x.id]}
                    onSelect={(d) => selectDevice(d)}
                    onExecute={(id) => showExecution(id)}
                    onShowData={(data) => setData(data)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Dialog
        open={executionDevice !== undefined}
        onClose={() => setExecutionDevice(undefined)}
      >
        {executionDevice && (
          <DeviceExecution
            device={executionDevice}
            onShowData={(data) => {
              setData(data);
              setExecutionDevice(undefined);
            }}
          />
        )}
      </Dialog>
      <Dialog open={data} onClose={() => setData(undefined)}>
        <pre>{JSON.stringify(data || {}, null, 2)} </pre>{' '}
      </Dialog>
    </>
  );
};
