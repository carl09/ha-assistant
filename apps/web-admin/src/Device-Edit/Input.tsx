import { UseFormRegister } from 'react-hook-form';

type InputProps = {
  name: string;
  label: string;
  register: UseFormRegister<any>;
  required?: boolean;
  hidden?: boolean;
  description?: string;
};

export const Input = ({
  label,
  name,
  register,
  required,
  hidden,
  description,
}: InputProps) => (
  <div className="form-row">
    {!hidden && (
      <label htmlFor={name} className="form-label">
        {label}
      </label>
    )}
    <input
      className="form-input"
      id={name}
      hidden={hidden}
      {...register(name, { required })}
    />
    {description && <div className="form-desc">{description}</div>}
  </div>
);
