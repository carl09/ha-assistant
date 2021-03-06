import { Control, Controller, FieldValues } from 'react-hook-form';
import { Editor } from '../Editor/Editor';

type InputEditorProps = {
  name: string;
  label: string;
  description?: string;
  type?: string;
  control: Control<FieldValues, any>;
};

export const InputEditor = ({
  label,
  name,
  description,
  control,
  type,
}: InputEditorProps) => (
  <div className="form-row">
    <label htmlFor={name} className="form-label">
      {label} {type && <div className="form-label-type">Type: {type}</div>}
    </label>

    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value, name } }) => (
        <Editor value={value} name={name} onChange={onChange} />
      )}
    />
    {description && <div className="form-desc">{description}</div>}
  </div>
);
