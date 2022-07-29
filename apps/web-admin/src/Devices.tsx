import { IDevice, logging } from '@ha-assistant/listner';
import { useState } from 'react';
import { Device } from './Device';

import './Devices.scss';

type DevicesProps = {
  devices?: IDevice[];
};
export const Devices = ({ devices }: DevicesProps) => {
  const [device, setDevice] = useState<IDevice>();
  const [addNew, setAddNew] = useState<boolean>(false);

  const selectDevice = (e: React.MouseEvent, d: IDevice) => {
    e.preventDefault();
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
        <a href="#" onClick={(e) => addNewDevice(e)}>
          Add New
        </a>
        <div className="device-grid">
          {(devices || []).map((x) => {
            return (
              <div className="device-grid-item" key={x.id}>
                <a href="#" onClick={(e) => selectDevice(e, x)}>
                  {x.name}
                </a>
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
