import { IDevice, logging } from '@ha-assistant/listner';
import { Button } from '../Components/Button';
import { snakecaseToTitlecase } from '../utils/format';
import { DeviceValueFormat } from './Device-Value-Format';
import { googleQuery } from '../Services/google.service';
import Icon from '@mdi/react';
import {
  mdiThermostat,
  mdiAirHumidifier,
  mdiLightSwitch,
  mdiDatabaseSearch,
  mdiRunFast,
  mdiMicrowave,
  mdiCoffeeMaker,
  mdiBlindsHorizontal,
} from '@mdi/js';

const getIcon = (deviceType: string): string => {
  switch (deviceType) {
    case 'action.devices.types.THERMOSTAT':
      return mdiThermostat;
    case 'action.devices.types.DEHUMIDIFIER':
      return mdiAirHumidifier;
    case 'action.devices.types.SWITCH':
      return mdiLightSwitch;
    case 'action.devices.types.MICROWAVE':
      return mdiMicrowave;
    case 'action.devices.types.COFFEE_MAKER':
      return mdiCoffeeMaker;
    case 'action.devices.types.BLINDS':
      return mdiBlindsHorizontal;
  }

  logging.warn('No Icon for deviceType', deviceType);
  return '';
};

type DeviceSummaryProps = {
  device: IDevice;
  deviceStats: { [key: string]: string };
  onSelect: (device: IDevice) => void;
  onExecute?: (deviceId: string) => void;
  onShowData: (data: any) => void;
};

export const DeviceSummary = ({
  device,
  deviceStats,
  onSelect,
  onExecute,
  onShowData,
}: DeviceSummaryProps) => {
  const selectDevice = (e: React.MouseEvent, d: IDevice) => {
    e.preventDefault();
    onSelect && onSelect(d);
  };

  const onQuery = (id: string) => {
    googleQuery(id).then((data) => onShowData && onShowData(data));
  };

  return (
    <>
      <a
        href="#"
        className="panel-link"
        onClick={(e) => selectDevice(e, device)}
      >
        <Icon className="device-icon" path={getIcon(device.deviceType)} />
        <div className="panel-header">{device.name}</div>
        <div className="panel-subheader">({device.room})</div>
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
          icon={mdiDatabaseSearch}
          label="Query"
          onClick={() => onQuery(device.id)}
        ></Button>
        {device.commands && Object.keys(device.commands).length !== 0 && (
          <Button
            icon={mdiRunFast}
            label="Execute"
            onClick={() => onExecute && onExecute(device.id)}
          ></Button>
        )}
      </div>
    </>
  );
};
