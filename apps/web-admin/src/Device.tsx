import { useEffect, useRef, useState } from 'react';
import { Path, useForm, UseFormRegister } from 'react-hook-form';
import {
  IDevice,
  logging,
  deviceTypes,
  deviceTraits,
  IDeviceTraitsStates,
} from '@ha-assistant/listner';

import './Device.scss';
import { snakecaseToTitlecase } from './utils/format';

type DeviceProps = {
  device?: IDevice;
  onDone?: () => void;
};

type InputProps = {
  name: string;
  label: string;
  register: UseFormRegister<any>;
  required?: boolean;
  hidden?: boolean;
  description?: string;
};

type SelectProps = {
  name: string;
  label: string;
  register: UseFormRegister<any>;
  required?: boolean;
};

const Input = ({
  label,
  name,
  register,
  required,
  hidden,
  description,
}: InputProps) => (
  <div className="form-row">
    {!hidden && (
      <label htmlFor={name} className="form-label">
        {label}
      </label>
    )}
    <input
      className="form-input"
      id={name}
      hidden={hidden}
      {...register(name, { required })}
    />
    {description && <div className="form-desc">{description}</div>}
  </div>
);

const DeviceSelect = ({ name, label, register, required }: SelectProps) => (
  <div className="form-row">
    <label htmlFor={name} className="form-label">
      {label}
    </label>
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

  const dialogRef = useRef<HTMLDialogElement>(null);

  const [deleteId, setDeleteId] = useState<string>();
  const [traits, setTraits] = useState<string[]>();
  const [states, setStates] = useState<{
    [name: string]: IDeviceTraitsStates;
  }>();

  const watchDeviceType = watch('deviceType');
  const watchName = watch('name');

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
    setDeleteId(id);
    dialogRef.current?.showModal();
  };

  const deleteAction = (remove: boolean) => {
    if (remove) {
      fetch(`api/device/${deleteId}`, {
        method: 'DELETE',
      }).then(() => {
        reset();
        onDone && onDone();
      });
      logging.warn('Deleting');
    } else {
      logging.warn('Not Deleting');
    }
    dialogRef.current?.close();
  };

  const dialogCancelOrClose = () => {
    setDeleteId(undefined);
    logging.warn('dialogCancelOrClose');
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
    <>
      <form className="device-form" onSubmit={handleSubmit(onSubmit)}>
        <h2>{watchName}</h2>

        <section className="device-section">
          <h3>Detail</h3>
          <Input label="Id" name="id" hidden register={register} required />
          <Input label="Name" name="name" register={register} required />
          <DeviceSelect
            label="Device Type"
            name="deviceType"
            register={register}
            required
          />
        </section>
        <section className="device-section">
          <h3>States</h3>
          {states &&
            Object.keys(states).map((x) => {
              return (
                <Input
                  key={x}
                  label={snakecaseToTitlecase(x)}
                  name={`states.${x}`}
                  description={states[x].hint}
                  register={register}
                />
              );
            })}
        </section>

        {errors.name && <span>This field is required</span>}
        {errors.deviceType && <span>This field is required</span>}
        <div className="form-actions">
          <input className="form-action primary" type="submit" />
          <input
            className="form-action"
            type="reset"
            onClick={() => {
              reset();
              onDone && onDone();
            }}
            value="Cancel"
          />
          {device && (
            <input
              className="form-action"
              type="button"
              onClick={() => {
                deleteDevice(device?.id);
              }}
              value="Delete"
            />
          )}
        </div>
      </form>

      <dialog
        onCancel={() => dialogCancelOrClose()}
        onClose={() => dialogCancelOrClose()}
        ref={dialogRef}
        className="device-delete-dialog"
      >
        <p>Are you Sure</p>
        <div className="form-actions">
          <input
            className="form-action primary"
            type="button"
            value="No"
            onClick={() => deleteAction(false)}
          />
          <input
            className="form-action"
            type="button"
            value="Yes"
            onClick={() => deleteAction(true)}
          />
        </div>
      </dialog>
    </>
  );
};
