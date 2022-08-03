import { deviceTypes } from '@ha-assistant/listner';
import { UseFormRegister } from 'react-hook-form';

type SelectProps = {
  name: string;
  label: string;
  register: UseFormRegister<any>;
  required?: boolean;
};

export const DeviceSelect = ({
  name,
  label,
  register,
  required,
}: SelectProps) => (
  <div className="form-row">
    <label htmlFor={name} className="form-label">
      {label}
    </label>
    <select className="form-select" id={name} {...register(name, { required })}>
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
