import { IDeviceTraitsProps } from '@ha-assistant/smart-home-schema';
import { Control, Controller, FieldValues } from 'react-hook-form';
import { Editor } from '../Editor/Editor';

type InputEditorProps = {
  name: string;
  label: string;
  description?: string;
  type?: string;
  control: Control<FieldValues, any>;
  mode: 'entities' | 'services';
  commandPrams?: { [name: string]: IDeviceTraitsProps };
  value?: any;
};

export const InputEditor = ({
  label,
  name,
  description,
  control,
  type,
  mode,
  commandPrams,
  value,
}: InputEditorProps) => (
  <div className="form-row">
    <label htmlFor={name} className="form-label">
      {label} {type && <div className="form-label-type">Type: {type}</div>}
    </label>

    <Controller
      name={name}
      control={control}
      defaultValue={value}
      render={({ field: { onChange, value, name } }) => (
        <Editor
          value={value}
          name={name}
          onChange={onChange}
          mode={mode}
          extraRootItems={
            commandPrams && {
              googleEvents: Object.keys(commandPrams),
            }
          }
        />
      )}
    />
    {description && <div className="form-desc">{description}</div>}
  </div>
);
