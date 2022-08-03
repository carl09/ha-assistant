import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  IDevice,
  logging,
  deviceTypes,
  deviceTraits,
  IDeviceTraitsStates,
  IDeviceTraitsAttributes,
} from '@ha-assistant/listner';
import './Device-Edit.scss';
import { snakecaseToTitlecase } from '../utils/format';
import { mdiDelete, mdiContentSave, mdiClose } from '@mdi/js';
import { Button } from '../_components/Button';
import { Input } from './Input';
import { DeviceSelect } from './Device-Select';
import { InputEditor } from './Input-Editor';

type DeviceProps = {
  device?: IDevice;
  onDone?: () => void;
};

export const DeviceEdit = ({ device, onDone }: DeviceProps) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm();

  const dialogRef = useRef<HTMLDialogElement>(null);

  const [deleteId, setDeleteId] = useState<string>();
  const [states, setStates] = useState<{
    [name: string]: IDeviceTraitsStates;
  }>();

  const [attributes, setAttributes] = useState<{
    [name: string]: IDeviceTraitsAttributes;
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
    }
    dialogRef.current?.close();
  };

  const dialogCancelOrClose = () => {
    setDeleteId(undefined);
  };

  useEffect(() => {
    reset({});
  }, [reset]);

  useEffect(() => {
    const dt = deviceTypes.find((x) => x.type === watchDeviceType);
    const s = dt?.traits.reduce<{ [name: string]: IDeviceTraitsStates }>(
      (acc, t) => {
        logging.debug('trate', t);
        return { ...acc, ...deviceTraits[t].states };
      },
      {
        online: {
          type: 'boolean',
          required: true,
          hint: 'If the device is online',
        } as IDeviceTraitsStates,
      }
    );

    const a = dt?.traits.reduce<{ [name: string]: IDeviceTraitsAttributes }>(
      (acc, t) => {
        return { ...acc, ...deviceTraits[t].attributes };
      },
      {}
    );

    setStates(s);
    setAttributes(a);
  }, [watchDeviceType]);

  useEffect(() => {
    logging.log('Device.useEffect', device);
    reset(device);
  }, [device, reset]);

  if (errors && Object.keys(errors).length) {
    logging.error('errors', errors);
  }

  return (
    <>
      <form className="device-form" onSubmit={handleSubmit(onSubmit)}>
        <h2>{watchName}</h2>

        <section className="device-section">
          <h3>Detail</h3>
          <Input label="Id" name="id" hidden register={register} />
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
                <InputEditor
                  key={x}
                  label={snakecaseToTitlecase(x)}
                  name={`states.${x}`}
                  description={states[x].hint}
                  control={control}
                  type={states[x].type}
                />
              );
            })}
        </section>

        <section className="device-section">
          <h3>Attributes</h3>
          {attributes &&
            Object.keys(attributes).map((x) => {
              return (
                <InputEditor
                  key={x}
                  label={snakecaseToTitlecase(x)}
                  name={`attributes.${x}`}
                  description={attributes[x].hint}
                  control={control}
                  type={attributes[x].type}
                />
              );
            })}
        </section>

        {errors.name && <span>This field is required</span>}
        {errors.deviceType && <span>This field is required</span>}

        <div className="form-actions">
          <Button
            value="Save"
            icon={mdiContentSave}
            type="submit"
            isPrimary
            onClick={handleSubmit(onSubmit)}
          />
          <Button
            value="Cancel"
            icon={mdiClose}
            type="reset"
            onClick={() => {
              reset();
              onDone && onDone();
            }}
          />
          {device && (
            <Button
              value="Delete"
              icon={mdiDelete}
              onClick={() => {
                deleteDevice(device?.id);
              }}
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
