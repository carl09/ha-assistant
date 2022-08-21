import { deviceTypes } from '@ha-assistant/smart-home-schema';
import { UseFormRegister } from 'react-hook-form';

type SelectProps = {
  name: string;
  label: string;
  register: UseFormRegister<any>;
  required?: boolean;
  value?: any;
};

export const DeviceSelect = ({
  name,
  label,
  register,
  required,
  value
}: SelectProps) => (
  <div className="form-row">
    <label htmlFor={name} className="form-label">
      {label}
    </label>
    <select className="form-select" id={name} {...register(name, { required, value })}>
      <option value=""></option>
      {deviceTypes.map((x) => {
        return (
          <option key={x.type} value={x.type}>
            {x.humanName}
          </option>
        );
      })}
    </select>
  </div>
);
