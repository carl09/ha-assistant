import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  IDevice,
  logging,
  deviceTypes,
  deviceTraits,
  IHomeAssistantArea,
  IDeviceTraitsProps,
  deleteDevice,
  IDeviceCommandProps,
} from '@ha-assistant/listner';
import './Device-Edit.scss';
import { snakecaseToTitlecase } from '../utils/format';
import { mdiDelete, mdiContentSave, mdiClose } from '@mdi/js';
import { Button } from '../Components/Button';
import { Input } from './Input';
import { DeviceSelect } from './Device-Select';
import { InputEditor } from './Input-Editor';
import { Select } from './Select';
import { createDevice, getAreas, updateDevice } from '../Services/device.service';


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
  const [rooms, setRooms] = useState<string[]>();
  const [states, setStates] = useState<{
    [name: string]: IDeviceTraitsProps;
  }>();
  const [commands, setCommands] = useState<IDeviceCommandProps[]>();

  const [attributes, setAttributes] = useState<{
    [name: string]: IDeviceTraitsProps;
  }>();

  const watchDeviceType = watch('deviceType');
  const watchName = watch('name');

  const onSubmit = (data: any) => {
    logging.log('onSubmit', data);

    (device && device.id
      ? updateDevice(device.id, data)
      : createDevice(data)
    ).then(() => {
      reset();
      onDone && onDone();
    });
  };

  const onDeleteDevice = (id: string) => {
    setDeleteId(id);
    dialogRef.current?.showModal();
  };

  const deleteAction = (remove: boolean) => {
    if (remove && deleteId) {
      deleteDevice(deleteId).then(() => {
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
    getAreas().then((areas: IHomeAssistantArea[]) => {
      logging.debug('areas', areas);
      setRooms(areas.map((x) => x.name));
    });
  }, []);

  useEffect(() => {
    reset({});
  }, [reset]);

  useEffect(() => {
    const dt = deviceTypes.find((x) => x.type === watchDeviceType);
    const s = dt?.traits.reduce<{ [name: string]: IDeviceTraitsProps }>(
      (acc, t) => {
        logging.debug('trate', t);
        return { ...acc, ...deviceTraits[t].states };
      },
      {
        online: {
          type: 'boolean',
          required: true,
          hint: 'If the device is online',
        } as IDeviceTraitsProps,
      }
    );

    const a = dt?.traits.reduce<{ [name: string]: IDeviceTraitsProps }>(
      (acc, t) => {
        return { ...acc, ...deviceTraits[t].attributes };
      },
      {}
    );

    const c = dt?.traits.reduce<IDeviceCommandProps[]>((acc, t) => {
      return [...acc, ...deviceTraits[t].commands];
    }, []);

    setStates(s);
    setAttributes(a);
    setCommands(c);

    console.info('Commands', c);
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
          <Select
            label="Room"
            name="room"
            control={control}
            options={rooms}
            hasEmptyOption
          />

          <select className="form-select" multiple {...register('traits')}>
            {Object.keys(deviceTraits).map((x) => {
              return (
                <option key={x} value={x}>
                  {x}
                </option>
              );
            })}
          </select>
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
                  mode="entities"
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
                  mode="entities"
                />
              );
            })}
        </section>

        <section className="device-section">
          <h3>Commands</h3>
          {commands &&
            commands.map((x) => {
              return (
                <InputEditor
                  key={x.command}
                  label={snakecaseToTitlecase(x.command)}
                  name={`commands.${x.command}`}
                  description="desc"
                  control={control}
                  type="type"
                  mode="services"
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
                onDeleteDevice(device?.id);
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
