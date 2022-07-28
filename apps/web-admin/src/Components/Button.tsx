import Icon from '@mdi/react';

import './Button.scss';

type ButtonProps = {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  icon?: string;
  value?: string;
  type?: 'button' | 'submit' | 'reset';
  isPrimary?: boolean;
  label?: string;
};

export const Button = ({
  onClick,
  icon,
  value,
  type = 'button',
  isPrimary,
  label,
}: ButtonProps) => {
  return (
    <button
      className={`btn ${isPrimary ? 'primary' : ''}`}
      style={{
        display: icon ? 'flex' : 'block',
        minWidth: value ? 100 : 0,
      }}
      type={type}
      onClick={onClick && onClick}
      title={label ? label : value}
    >
      {icon && <Icon className="device-icon" path={icon} />} {value}
    </button>
  );
};
