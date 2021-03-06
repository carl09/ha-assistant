import { deviceTypes } from '@ha-assistant/listner';
import {
  Control,
  Controller,
  FieldValues,
  UseFormRegister,
} from 'react-hook-form';

type SelectProps = {
  name: string;
  label: string;
  control: Control<FieldValues, any>;
  required?: boolean;
  options?: string[] | { value: string; label: string }[];
  hasEmptyOption?: boolean;
};

export const Select = ({
  name,
  label,
  options,
  hasEmptyOption,
  control,
}: SelectProps) => (
  <div className="form-row">
    <label htmlFor={name} className="form-label">
      {label}
    </label>
    <Controller
      control={control}
      name={name}
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

    {/* <select className="form-select" id={name} {...register(name, { required })}>
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
    </select> */}
  </div>
);
