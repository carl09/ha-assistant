import Icon from '@mdi/react';

import './Button.scss';

type ButtonProps = {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  icon?: string;
  value: string;
  type?: 'button' | 'submit' | 'reset';
  isPrimary?: boolean;
};

export const Button = ({
  onClick,
  icon,
  value,
  type = 'button',
  isPrimary,
}: ButtonProps) => {
  return (
    <button
      className={`btn ${isPrimary ? 'primary' : ''}`}
      type={type}
      onClick={onClick && onClick}
    >
      {icon && <Icon className="device-icon" path={icon} />} {value}
    </button>
  );
};
