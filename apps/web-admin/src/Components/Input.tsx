import { UseFormRegister } from 'react-hook-form';

type InputProps = {
  name: string;
  label: string;
  register: UseFormRegister<any>;
  required?: boolean;
  hidden?: boolean;
  description?: string;
  myType?: 'text' | 'number' | 'checkbox';
};

export const Input = ({
  label,
  name,
  register,
  required,
  hidden,
  description,
  myType,
}: InputProps) => {
  console.log('Input type', name, myType);
  return (
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
        type={myType}
        {...register(name, { required, valueAsNumber: myType === 'number' })}
      />
      {description && <div className="form-desc">{description}</div>}
    </div>
  );
};
