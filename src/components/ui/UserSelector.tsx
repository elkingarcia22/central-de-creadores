import React from 'react';
import Select from './Select';

export interface User {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

export interface UserSelectorProps {
  value?: string;
  onChange: (userId: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  users?: User[];
}

const UserSelector: React.FC<UserSelectorProps> = ({
  value,
  onChange,
  placeholder = 'Seleccionar usuario',
  label,
  required = false,
  disabled = false,
  className = '',
  users = []
}) => {
  const userOptions = users.map(user => ({
    value: user.id,
    label: `${user.full_name} (${user.email})`
  }));

  const handleChange = (value: string | number) => {
    onChange(value.toString());
  };

  return (
    <Select
      value={value}
      onChange={handleChange}
      options={userOptions}
      placeholder={placeholder}
      label={label}
      required={required}
      disabled={disabled}
      className={className}
    />
  );
};

export default UserSelector; 