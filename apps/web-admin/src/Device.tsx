import { useEffect, forwardRef, useState } from 'react';
import { Path, useForm, UseFormRegister } from 'react-hook-form';
import {
  IDevice,
  logging,
  deviceTypes,
  deviceTraits,
  IDeviceTraitsStates,
} from '@ha-assistant/listner';

import './Device.scss';

type DeviceProps = {
  device?: IDevice;
  onDone?(): () => void;
};

type InputProps = {
  name: string;
  label: string;
  register: UseFormRegister<any>;
  required?: boolean;
  hidden?: boolean;
};

type SelectProps = {
  name: string;
  label: string;
  register: UseFormRegister<any>;
  required?: boolean;
};

const Input = ({ label, name, register, required, hidden }: InputProps) => (
  <div className="form-row">
    <label htmlFor={name} className="form-label">{!hidden && label}</label>
    <input
      className="form-input"
      id={name}
      hidden={hidden}
      {...register(name, { required })}
    />
  </div>
);

const DeviceSelect = ({ name, label, register, required }: SelectProps) => (
  <div className="form-row">
    <label htmlFor={name} className="form-label">{label}</label>
    <select className="form-select" id={name} {...register(name, { required })}>
      <option value=""></option>
      {deviceTypes.map((x) => {
        return (
          <option key={x.type} value={x.type}>
            {x.humanName}
          </option>
        );
      })}
    </select>
  </div>
);

export const Device = ({ device, onDone }: DeviceProps) => {
  // logging.log('Device', device, onDone);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm();

  const [traits, setTraits] = useState<string[]>();
  const [states, setStates] = useState<{
    [name: string]: IDeviceTraitsStates;
  }>();

  const watchDeviceType = watch('deviceType');

  const onSubmit = (data: any) => {
    logging.log('onSubmit', data);

    device && device.id
      ? fetch(`api/device/${device.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }).then(() => {
          reset();
          onDone && onDone();
        })
      : fetch('api/device', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }).then(() => {
          reset();
          onDone && onDone();
        });
  };

  const deleteDevice = (id: string) => {
    fetch(`api/device/${id}`, {
      method: 'DELETE',
    }).then(() => {
      reset();
      onDone && onDone();
    });
  };

  useEffect(() => {
    reset({});
  }, [reset]);

  useEffect(() => {
    logging.debug('watchDeviceType', watchDeviceType);

    const dt = deviceTypes.find((x) => x.type === watchDeviceType);

    logging.debug('deviceType', dt);

    setTraits(dt?.traits);

    const s = dt?.traits.reduce<{ [name: string]: IDeviceTraitsStates }>(
      (acc, t) => {
        logging.debug('trate', t);
        return { ...acc, ...deviceTraits[t].states };
      },
      {}
    );

    setStates(s);

    logging.debug('states', s);
  }, [watchDeviceType]);

  useEffect(() => {
    logging.log('Device.useEffect', device);
    reset(device);
  }, [device, reset]);

  return (
    <form className="device-form" onSubmit={handleSubmit(onSubmit)}>
      {/* <input {...register('name', { required: true })} /> */}
      <Input label="Id" name="id" hidden register={register} required />
      <Input label="Name" name="name" register={register} required />
      <DeviceSelect
        label="Device Type"
        name="deviceType"
        register={register}
        required
      />

      {Object.keys(states || {}).map((x) => {
        return (
          <Input key={x} label={x}  name={`states.${x}`} register={register} />
        );
      })}

      {errors.name && <span>This field is required</span>}
      {errors.deviceType && <span>This field is required</span>}

      <input type="submit" />
      <input
        type="reset"
        onClick={() => {
          reset();
          onDone && onDone();
        }}
      />
      {device && (
        <input
          type="button"
          onClick={() => {
            deleteDevice(device?.id);
          }}
          value="Delete"
        />
      )}
    </form>
  );
};
