import { deviceTraits } from '@ha-assistant/smart-home-schema';
import { UseFormRegister } from 'react-hook-form';

type SelectProps = {
  name: string;
  label: string;
  register: UseFormRegister<any>;
  required?: boolean;
  value?: any;
};

export const DeviceTraits = ({
  name,
  label,
  register,
  required,
  value,
}: SelectProps) => (
  <div className="form-row">
    <label htmlFor={name} className="form-label">
      {label}
    </label>
    <select
      multiple
      className="form-select"
      id={name}
      {...register(name, { required, value })}
    >
      {Object.keys(deviceTraits).map((x) => {
        const value = deviceTraits[x];
        return (
          <option key={x} value={x}>
            {value.humanName}
          </option>
        );
      })}
    </select>
  </div>
);
