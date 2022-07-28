import { IDevice } from '@ha-assistant/listner';
import { Button } from '../Components/Button';
import { snakecaseToTitlecase } from '../utils/format';
import { DeviceValueFormat } from './Device-Value-Format';
import { mdiSync } from '@mdi/js';
import { googleQuery } from '../Services/google.service';
import { useState } from 'react';
import { Dialog } from '../Components/Dialog';

type DeviceSummaryProps = {
  device: IDevice;
  deviceStats: { [key: string]: string };
  onSelect: (device: IDevice) => void;
};

export const DeviceSummary = ({
  device,
  deviceStats,
  onSelect,
}: DeviceSummaryProps) => {
  const [data, setData] = useState<any>();

  const selectDevice = (e: React.MouseEvent, d: IDevice) => {
    e.preventDefault();
    onSelect && onSelect(d);
  };

  const onQuery = (id: string) => {
    googleQuery(id).then((data) => setData(data));
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
                {snakecaseToTitlecase(y)}:{' '}
                <DeviceValueFormat value={deviceStats[y]} />
              </li>
            );
          })}
        </ul>
      )}

      <div className="form-actions">
        <Button
          icon={mdiSync}
          label="Sync"
          onClick={() => onQuery(device.id)}
        ></Button>
      </div>

      <Dialog open={data} onClose={() => setData(undefined)}>
        <pre>{JSON.stringify(data || {}, null, 2)} </pre>{' '}
      </Dialog>
    </>
  );
};
