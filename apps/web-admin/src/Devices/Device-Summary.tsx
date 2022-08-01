import { IDevice, logging } from '@ha-assistant/listner';
import { snakecaseToTitlecase } from '../utils/format';
import { DeviceValueFormat } from './Device-Value-Format';

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
                {snakecaseToTitlecase(y)}:{' '}
                <DeviceValueFormat value={deviceStats[y]} />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
};
