import { IDeviceTraitsProps } from '@ha-assistant/listner';
import { useState, useEffect } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { Editor } from '../Editor/Editor';

type ControlValue = { command?: string; args?: string; target?: string };

type InputCommandProps = {
  name: string;
  label: string;
  description?: string;
  type?: string;
  control: Control<FieldValues, ControlValue>;
  commandPrams?: { [name: string]: IDeviceTraitsProps };
};

type FakeProps = {
  value?: ControlValue;
  commandPrams?: { [name: string]: IDeviceTraitsProps };
  onChange: (...event: unknown[]) => void;
};

export const Fake = ({ value, onChange, commandPrams }: FakeProps) => {
  {
    console.log('Fake.value', value);

    const [commandName, setCommandName] = useState<string | undefined>();
    const [commandArgs, setCommandArgs] = useState<string | undefined>();
    const [commandTarget, setCommandTarget] = useState<string | undefined>();

    useEffect(() => {
      if (value) {
        setCommandName(value.command);
        setCommandArgs(value.args);
        setCommandTarget(value.target);
      }
    }, []);

    useEffect(() => {
      console.log('useEffect command', { commandName, commandTarget });
      onChange &&
        onChange({
          command: commandName,
          args: commandArgs,
          target: commandTarget,
        });
    }, [commandName, commandArgs, commandTarget]);

    return (
      <>
        <Editor
          value={value?.command}
          onChange={(e) => {
            setCommandName(e);
          }}
          name="command"
          mode="services"
          extraRootItems={
            commandPrams && {
              googleEvents: Object.keys(commandPrams),
            }
          }
        />
        <Editor
          value={value?.target}
          onChange={(e) => {
            setCommandTarget(e);
          }}
          name="target"
          mode="entities"
        />
      </>
    );
  }
};

export const InputCommand = ({
  label,
  name,
  description,
  control,
  type,
  commandPrams,
}: InputCommandProps) => {
  return (
    <div className="form-row">
      <label htmlFor={name} className="form-label">
        {label} {type && <div className="form-label-type">Type: {type}</div>}
      </label>

      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => {
          return (
            <Fake
              value={value}
              onChange={onChange}
              commandPrams={commandPrams}
            />
          );
        }}
      />
      {description && <div className="form-desc">{description}</div>}
    </div>
  );
};
