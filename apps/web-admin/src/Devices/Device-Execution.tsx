import {
  IDevice,
  IDeviceCommand,
} from '@ha-assistant/listner';
import { deviceTraits, IDeviceTraitsProps } from '@ha-assistant/smart-home-schema';
import { useForm } from 'react-hook-form';
import { Button } from '../Components/Button';
import { Input } from '../Components/Input';
import { mockExecute } from '../Services/mock-data';

const commandIsValid = (cmd: IDeviceCommand): boolean => {
  if (!cmd) {
    return false;
  }

  if (!cmd.command) {
    return false;
  }

  return true;
};

type DeviceExecutionProps = {
  device: IDevice;
  onShowData: (data: any) => void;
};

const deviceTraitsCommands = Object.keys(deviceTraits).reduce<{
  [key: string]: { [name: string]: IDeviceTraitsProps };
}>((acc, key) => {
  (deviceTraits[key].commands || []).forEach((c) => {
    acc[c.command] = c.params;
  });

  return acc;
}, {});

type DeviceRunProps = {
  p: { [name: string]: IDeviceTraitsProps };
  commandName: string;
  deviceId: string;
  onShowData: (data: any) => void;
};

const DeviceRun = ({
  p,
  commandName,
  deviceId,
  onShowData,
}: DeviceRunProps) => {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data: any) => {
    mockExecute(deviceId, commandName, data).then((res) => {
      onShowData && onShowData(res);
    });
  };

  return (
    <form className="device-form" onSubmit={handleSubmit(onSubmit)}>
      {Object.keys(p).map((z) => {
        console.log('p', z, p[z].type);
        if (p[z].type === 'boolean') {
          return (
            <Input
              key={z}
              label={z}
              name={z}
              myType="checkbox"
              register={register}
            />
          );
        } else if (p[z].type === 'integer' || p[z].type === 'number') {
          return (
            <Input
              key={z}
              label={z}
              name={z}
              myType="number"
              register={register}
              required
            />
          );
        }
        return (
          <Input key={z} label={z} name={z} register={register} required />
        );
      })}

      <div className="form-actions">
        <Button
          value="Run"
          type="submit"
          isPrimary
          onClick={handleSubmit(onSubmit)}
        />
      </div>
    </form>
  );
};

export const DeviceExecution = ({
  device,
  onShowData,
}: DeviceExecutionProps) => {
  // console.log('DeviceExecution', device.commands);

  const commands =
    device && device.commands
      ? Object.keys(device.commands).reduce<{
          [prop: string]: { [name: string]: IDeviceTraitsProps };
        }>((acc, key) => {
          if (device.commands && commandIsValid(device.commands[key])) {
            const lookup = `action.devices.commands.${key}`;

            const parms = deviceTraitsCommands[lookup];
            if (parms) {
              acc[key] = parms;
            }
          }

          return acc;
        }, {})
      : {};

  console.log('DeviceExecution commands', commands);

  return (
    <div>
      {Object.keys(commands).map((cmd) => {
        return (
          <div key={cmd}>
            <div>{cmd}</div>

            <DeviceRun
              deviceId={device.id}
              commandName={`action.devices.commands.${cmd}`}
              p={commands[cmd]}
              onShowData={(data) => onShowData && onShowData(data)}
            />
          </div>
        );
      })}
    </div>
  );
};
