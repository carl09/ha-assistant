import {
  Control,
  Controller,
  FieldValues,
} from 'react-hook-form';

type SelectProps = {
  name: string;
  label: string;
  control: Control<FieldValues, any>;
  required?: boolean;
  options?: string[] | { value: string; label: string }[];
  hasEmptyOption?: boolean;
  value?: any;
};

export const Select = ({
  name,
  label,
  options,
  hasEmptyOption,
  control,
  value
}: SelectProps) => (
  <div className="form-row">
    <label htmlFor={name} className="form-label">
      {label}
    </label>
    <Controller
      control={control}
      name={name}
      defaultValue={value}
      render={({ field }) => {
        return (
          <select className="form-select" id={name} {...field}>
            {hasEmptyOption && <option value=""></option>}
            {options &&
              options.map((x) => {
                if (typeof x === 'string') {
                  return (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  );
                }

                return (
                  <option key={x.value} value={x.value}>
                    {x.label}
                  </option>
                );
              })}
          </select>
        );
      }}
    />
  </div>
);
