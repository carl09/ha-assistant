import { IDevice, logging } from '@ha-assistant/listner';
import { useState } from 'react';
import { DeviceEdit } from '../Device-Edit/Device-Edit';
import './Devices.scss';
import { useWindowDimensions } from '../utils/useWindowDimensions';
import { DeviceSummary } from './Device-Summary';
import { mdiPlusCircleOutline } from '@mdi/js';
import { Button } from '../Components/Button';

type DevicesProps = {
  devices?: IDevice[];
  devicesStatus?: { [key: string]: any };
};
export const Devices = ({ devices, devicesStatus }: DevicesProps) => {
  const [device, setDevice] = useState<IDevice>();
  const [addNew, setAddNew] = useState<boolean>(false);
  const { width } = useWindowDimensions();

  const selectDevice = (d: IDevice) => {
    logging.log(`selected ${d.name}`);
    setAddNew(false);
    setDevice(d);
  };

  const addNewDevice = () => {
    setDevice(undefined);
    setAddNew(true);
  };

  const clearSelected = () => {
    setDevice(undefined);
    setAddNew(false);
  };

  const isSmallScreen = width < 1000;
  const isEditing = device || addNew;
  const showList = !(isEditing && isSmallScreen);

  return (
    <div className="devices-list">
      {showList && (
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
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
      {isEditing && (
        <div className="devices-list-row">
          <DeviceEdit device={device} onDone={() => clearSelected()} />
        </div>
      )}
    </div>
  );
};
