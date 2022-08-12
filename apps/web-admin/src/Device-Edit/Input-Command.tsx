import { IDeviceTraitsProps, logging } from '@ha-assistant/listner';
import { ChangeEvent, useState, useEffect } from 'react';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { Editor } from '../Editor/Editor';
import { get } from '../utils/format';

type ControlValue = { command?: string; args?: string; commandTarget?: string };

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

    const [command, setCommand] = useState<string | undefined>();
    const [commandArgs, setCommandArgs] = useState<string | undefined>();
    const [commandTarget, setCommandTarget] = useState<string | undefined>();

    useEffect(() => {
      if (value) {
        setCommand(value.command);
        setCommandArgs(value.args);
        setCommandTarget(value.commandTarget);
      }
    }, []);

    useEffect(() => {
      console.log('useEffect command', command, commandTarget);
      onChange &&
        onChange({
          command,
          args: commandArgs,
          commandTarget,
        });
    }, [command, commandArgs, commandTarget]);

    return (
      <>
        <Editor
          value={value?.command}
          onChange={(e) => {
            setCommand(e);
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
          value={value?.commandTarget}
          onChange={(e) => {
            setCommandTarget(e);
          }}
          name="commandTarget"
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
