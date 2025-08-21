import React from 'react';
import UserSelectorWithAvatar from './UserSelectorWithAvatar';

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
  // Convertir usuarios al formato esperado por UserSelectorWithAvatar
  const userOptions = users.map(user => ({
    id: user.id,
    full_name: user.full_name || user.nombre || 'Sin nombre',
    email: user.email || user.correo || 'sin-email@ejemplo.com',
    avatar_url: user.avatar_url || undefined
  }));

  // Pasar el valor tal como está, incluyendo 'todos'
  const selectedValue = value;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      <UserSelectorWithAvatar
        value={selectedValue}
        onChange={onChange}
        users={userOptions}
        placeholder={placeholder}
        disabled={disabled}
        className={fullWidth ? 'w-full' : ''}
      />
    </div>
  );
}
