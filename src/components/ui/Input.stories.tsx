import type { Meta, StoryObj } from '@storybook/react';

const Input = ({ 
  placeholder = '', 
  type = 'text', 
  value = '', 
  onChange,
  className = '',
  disabled = false 
}: { 
  placeholder?: string; 
  type?: string; 
  value?: string; 
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
    />
  );
};

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Texto de placeholder',
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel'],
      description: 'Tipo de input',
    },
    value: {
      control: 'text',
      description: 'Valor del input',
    },
    disabled: {
      control: 'boolean',
      description: 'Estado deshabilitado',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Escribe algo aquí...',
  },
};

export const WithValue: Story = {
  args: {
    placeholder: 'Escribe algo aquí...',
    value: 'Texto de ejemplo',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'tu@email.com',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Contraseña',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Campo deshabilitado',
    disabled: true,
  },
};

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: 'Ingresa un número',
  },
};
