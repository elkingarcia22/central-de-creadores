import type { Meta, StoryObj } from '@storybook/react';

const SimpleButton = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  onClick
}: { 
  children: React.ReactNode; 
  variant?: 'primary' | 'secondary' | 'success' | 'error';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: () => void;
}) => {
  const baseStyles = {
    border: 'none',
    borderRadius: '6px',
    fontWeight: '500',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  };

  const variants = {
    primary: {
      backgroundColor: '#3B82F6',
      color: '#FFFFFF',
      '&:hover': { backgroundColor: '#2563EB' }
    },
    secondary: {
      backgroundColor: '#6B7280',
      color: '#FFFFFF',
      '&:hover': { backgroundColor: '#4B5563' }
    },
    success: {
      backgroundColor: '#10B981',
      color: '#FFFFFF',
      '&:hover': { backgroundColor: '#059669' }
    },
    error: {
      backgroundColor: '#EF4444',
      color: '#FFFFFF',
      '&:hover': { backgroundColor: '#DC2626' }
    }
  };

  const sizes = {
    small: { padding: '8px 16px', fontSize: '14px' },
    medium: { padding: '12px 24px', fontSize: '16px' },
    large: { padding: '16px 32px', fontSize: '18px' }
  };

  const styles = {
    ...baseStyles,
    ...variants[variant],
    ...sizes[size],
    opacity: disabled ? 0.5 : 1
  };

  return (
    <button 
      style={styles} 
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const meta: Meta<typeof SimpleButton> = {
  title: 'UI/SimpleButton',
  component: SimpleButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Texto del botón',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'error'],
      description: 'Variante del botón',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Tamaño del botón',
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
    children: 'Botón',
  },
};

export const Primary: Story = {
  args: {
    children: 'Botón Primario',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Botón Secundario',
    variant: 'secondary',
  },
};

export const Success: Story = {
  args: {
    children: 'Botón de Éxito',
    variant: 'success',
  },
};

export const Error: Story = {
  args: {
    children: 'Botón de Error',
    variant: 'error',
  },
};

export const Small: Story = {
  args: {
    children: 'Botón Pequeño',
    size: 'small',
  },
};

export const Large: Story = {
  args: {
    children: 'Botón Grande',
    size: 'large',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Botón Deshabilitado',
    disabled: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <SimpleButton variant="primary">Primario</SimpleButton>
      <SimpleButton variant="secondary">Secundario</SimpleButton>
      <SimpleButton variant="success">Éxito</SimpleButton>
      <SimpleButton variant="error">Error</SimpleButton>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <SimpleButton size="small">Pequeño</SimpleButton>
      <SimpleButton size="medium">Mediano</SimpleButton>
      <SimpleButton size="large">Grande</SimpleButton>
    </div>
  ),
};
