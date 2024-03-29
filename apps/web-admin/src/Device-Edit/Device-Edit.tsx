import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import {
  IDevice,
  logging,
  IHomeAssistantArea,
  IDeviceCommand,
} from '@ha-assistant/listner';
import {
  deviceTypes,
  deviceTraits,
  IDeviceTraitsProps,
  IDeviceCommandProps,
} from '@ha-assistant/smart-home-schema';
import './Device-Edit.scss';
import { snakecaseToTitlecase } from '../utils/format';
import { mdiDelete, mdiContentSave, mdiClose } from '@mdi/js';
import { Button } from '../Components/Button';
import {
  createDevice,
  deleteDevice,
  getAreas,
  updateDevice,
} from '../Services/device.service';
import { Input } from '../Components/Input';
import { Select } from '../Components/Select';
import { DeviceSelect } from '../Components/Device-Select';
import { DeviceTraits } from '../Components/Device-Traits';
import { InputEditor } from '../Components/Input-Editor';

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
    setValue,
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
  const watchTraits: string[] | undefined = watch('traits');
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

  const handleKeypress = (event: KeyboardEvent<HTMLFormElement>) => {
    const charCode = String.fromCharCode(event.which).toLowerCase();
    if (event.ctrlKey && charCode === 's') {
      logging.debug('CTRL+S Pressed');
      handleSubmit(onSubmit)();
      event.preventDefault();
    }
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
    const dt = deviceTypes.find(
      (x) => x.type === (watchDeviceType || device?.deviceType)
    );
    if (dt) {
      if (dt.type !== device?.deviceType) {
        setValue('traits', dt.traits);
      }
    } else {
      setValue('traits', []);
    }
  }, [watchDeviceType, setValue, device]);

  useEffect(() => {
    if (watchTraits) {
      const s = watchTraits.reduce<{ [name: string]: IDeviceTraitsProps }>(
        (acc, t) => {
          logging.debug('trate', t);
          return { ...acc, ...deviceTraits[t].states };
        },
        {
          online: {
            type: 'boolean',
            required: true,
            description: 'If the device is online',
          } as IDeviceTraitsProps,
        }
      );

      const a = watchTraits.reduce<{ [name: string]: IDeviceTraitsProps }>(
        (acc, t) => {
          return { ...acc, ...deviceTraits[t].attributes };
        },
        {}
      );

      const c = watchTraits.reduce<IDeviceCommandProps[]>((acc, t) => {
        return [...acc, ...deviceTraits[t].commands];
      }, []);

      setStates(s);
      setAttributes(a);
      setCommands(c);
      console.log('commands', c);
    } else {
      setStates(undefined);
      setAttributes(undefined);
      setCommands(undefined);
    }
  }, [watchTraits]);

  // useEffect(() => {
  //   logging.log('Device.useEffect', device);
  //   reset(device || {}, { keepValues: false });
  // }, [device, reset]);

  if (errors && Object.keys(errors).length) {
    logging.error('errors', errors);
  }

  return (
    <>
      <form
        onKeyDown={(e) => handleKeypress(e)}
        className="device-form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2>{watchName}</h2>

        <section className="device-section">
          <h3>Detail</h3>
          <Input
            value={device?.id}
            label="Id"
            name="id"
            hidden
            register={register}
          />
          <Input
            value={device?.name}
            label="Name"
            name="name"
            register={register}
            required
          />
          <Select
            label="Room"
            name="room"
            control={control}
            options={rooms}
            hasEmptyOption
            value={device?.room}
          />
          <DeviceSelect
            label="Device Type"
            name="deviceType"
            register={register}
            value={device?.deviceType}
            required
          />
          <DeviceTraits
            label="Traits"
            name="traits"
            value={device?.traits}
            register={register}
          />
        </section>
        <section className="device-section">
          <h3>States</h3>
          {states &&
            Object.keys(states).map((x) => {
              const value = device?.states[x];
              return (
                <InputEditor
                  key={x}
                  label={snakecaseToTitlecase(x)}
                  name={`states.${x}`}
                  description={states[x].description}
                  control={control}
                  type={states[x].type}
                  mode="entities"
                  value={value}
                />
              );
            })}
        </section>

        <section className="device-section">
          <h3>Attributes</h3>
          {attributes &&
            Object.keys(attributes).map((x) => {
              const value = device?.attributes[x];
              return (
                <InputEditor
                  key={x}
                  label={snakecaseToTitlecase(x)}
                  name={`attributes.${x}`}
                  description={attributes[x].description}
                  control={control}
                  type={attributes[x].type}
                  mode="entities"
                  value={value}
                />
              );
            })}
        </section>

        <section className="device-section">
          <h3>Commands</h3>
          {commands &&
            commands.map((x) => {
              const [commandName] = x.command.split('.').slice(-1);
              const value: IDeviceCommand =
                device && device.commands && commandName in device.commands
                  ? device.commands[commandName]
                  : { command: '', target: '' };
              return (
                <div key={`${commandName}`} className="command-group">
                  <h4>{snakecaseToTitlecase(commandName)}</h4>
                  <InputEditor
                    key={`${commandName}command`}
                    label={`command`}
                    name={`commands.${commandName}.command`}
                    description="HA Command Name"
                    control={control}
                    type="string"
                    mode="services"
                    commandPrams={x.params}
                    value={value.command}
                  />
                  <InputEditor
                    key={`${commandName}args`}
                    label={`args`}
                    name={`commands.${commandName}.args`}
                    description="HA Args"
                    control={control}
                    type="object"
                    mode="entities"
                    commandPrams={x.params}
                    value={value.args}
                  />
                  <InputEditor
                    key={`${commandName}target`}
                    label={`target`}
                    name={`commands.${commandName}.target`}
                    description="HA Command Target"
                    control={control}
                    type="string"
                    mode="entities"
                    value={value.target}
                  />
                </div>
                // <InputCommand
                //   key={x.command}
                //   label={snakecaseToTitlecase(commandName)}
                //   name={`commands.${commandName}`}
                //   control={control}
                //   type="type"
                //   commandPrams={x.params}
                // />
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
