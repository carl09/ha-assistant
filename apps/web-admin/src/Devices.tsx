import { IDevice, logging } from '@ha-assistant/listner';
import { useState } from 'react';
import { Device } from './Device';

import './Devices.scss';

type DeviceSummaryProps = {
  device: IDevice;
  deviceStats: { [key: string]: string };
  onSelect: (device: IDevice) => void;
};

const DeviceValueFormat = ({ value }: { value: boolean | number | string }) => {
  if (typeof value === 'number') {
    return <div className="format-number">{value}</div>;
  }
  if (typeof value === 'boolean') {
    return <div className="format-boolean">{value}</div>;
  }
  if (typeof value === 'string') {
    return <div className="format-string">{value}</div>;
  }
  return <div className="format-unknown">{value}</div>;
};

const snakeToTitle = (value: string): string => {
  const result = value.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
};

const DeviceSummary = ({
  device,
  deviceStats,
  onSelect,
}: DeviceSummaryProps) => {
  const selectDevice = (e: React.MouseEvent, d: IDevice) => {
    e.preventDefault();
    onSelect && onSelect(device);
  };

  return (
    <>
      <a
        href="#"
        className="panel-link"
        onClick={(e) => selectDevice(e, device)}
      >
        <div className="panel-header">{device.name}</div>
      </a>

      {deviceStats && (
        <ul className="panel-stats">
          {Object.keys(deviceStats).map((y) => {
            return (
              <li className="panel-stats-item" key={`${device.id}-${y}`}>
                {snakeToTitle(y)}: <DeviceValueFormat value={deviceStats[y]} />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
};

type DevicesProps = {
  devices?: IDevice[];
  devicesStatus?: { [key: string]: any };
};
export const Devices = ({ devices, devicesStatus }: DevicesProps) => {
  const [device, setDevice] = useState<IDevice>();
  const [addNew, setAddNew] = useState<boolean>(false);

  const selectDevice = (d: IDevice) => {
    logging.log(`selected ${d.name}`);
    setAddNew(false);
    setDevice(d);
  };

  const addNewDevice = (e: React.MouseEvent) => {
    e.preventDefault();
    setDevice(undefined);
    setAddNew(true);
  };

  const clearSelected = () => {
    setDevice(undefined);
    setAddNew(false);
  };

  return (
    <div className="devices-list">
      <div className="devices-list-row">
        <a href="#" className="add-new-device" onClick={(e) => addNewDevice(e)}>
          Add New
        </a>
        <div className="device-grid">
          {(devices || []).map((x) => {
            return (
              <div className="device-grid-item" key={x.id}>
                <DeviceSummary
                  device={x}
                  deviceStats={devicesStatus && devicesStatus[x.name]}
                  onSelect={(d) => selectDevice(d)}
                />
              </div>
            );
          })}
        </div>
      </div>
      {(device || addNew) && (
        <div className="devices-list-row">
          <Device device={device} onDone={() => clearSelected()} />
        </div>
      )}
    </div>
  );
};
