import { deviceTraits } from '@ha-assistant/listner';
import { UseFormRegister } from 'react-hook-form';

type SelectProps = {
  name: string;
  label: string;
  register: UseFormRegister<any>;
  required?: boolean;
};

export const DeviceTraits = ({
  name,
  label,
  register,
  required,
}: SelectProps) => (
  <div className="form-row">
    <label htmlFor={name} className="form-label">
      {label}
    </label>
    <select multiple className="form-select" id={name} {...register(name, { required })}>
      {Object.keys(deviceTraits).map((x) => {
        return (
          <option key={x} value={x}>
            {x}
          </option>
        );
      })}
    </select>
  </div>
);
