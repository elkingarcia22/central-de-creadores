import React from 'react';
import Select from './Select';
import SimpleAvatar from './SimpleAvatar';

interface User {
  id: string;
  full_name?: string | null;
  nombre?: string | null;
  email?: string | null;
  correo?: string | null;
  avatar_url?: string | null;
}

interface UserSelectProps {
  value?: string;
  onChange: (value: string) => void;
  users: User[];
  placeholder?: string;
  fullWidth?: boolean;
  disabled?: boolean;
}

export default function UserSelect({
  value,
  onChange,
  users,
  placeholder = "Seleccionar usuario...",
  fullWidth = false,
  disabled = false
}: UserSelectProps) {
  const options = [
    { value: 'todos', label: 'Todos' },
    ...users.map(user => ({
      value: user.id,
      label: `${user.full_name || user.nombre || user.email || user.correo || 'Sin nombre'} ${user.avatar_url ? '👤' : ''}`
    }))
  ];

  return (
    <Select
      value={value || 'todos'}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      fullWidth={fullWidth}
      disabled={disabled}
    />
  );
}
