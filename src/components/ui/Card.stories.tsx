import type { Meta, StoryObj } from '@storybook/react';

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border ${className}`}>
      {children}
    </div>
  );
};

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Contenido del card',
    },
    className: {
      control: 'text',
      description: 'Clases CSS adicionales',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Contenido del card',
  },
};

export const WithTitle: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Título del Card</h3>
        <p className="text-gray-600">Este es el contenido del card con un título.</p>
      </div>
    ),
  },
};

export const WithActions: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Card con Acciones</h3>
        <p className="text-gray-600 mb-4">Este card incluye botones de acción.</p>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Acción 1
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
            Acción 2
          </button>
        </div>
      </div>
    ),
  },
};

export const Compact: Story = {
  args: {
    children: 'Card compacto',
    className: 'p-4',
  },
};

export const Large: Story = {
  args: {
    children: 'Card grande',
    className: 'p-8',
  },
};
