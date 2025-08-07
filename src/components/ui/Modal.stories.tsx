import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

const Modal = ({ 
  isOpen = false, 
  onClose, 
  title = '', 
  children,
  size = 'md'
}: { 
  isOpen?: boolean; 
  onClose?: () => void; 
  title?: string; 
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full mx-4`}>
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const ModalExample = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenLarge, setIsOpenLarge] = useState(false);

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Abrir Modal
      </button>
      
      <button
        onClick={() => setIsOpenLarge(true)}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-2"
      >
        Abrir Modal Grande
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Modal de Ejemplo"
      >
        <p>Este es el contenido del modal.</p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Confirmar
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isOpenLarge}
        onClose={() => setIsOpenLarge(false)}
        title="Modal Grande"
        size="lg"
      >
        <p>Este es un modal más grande con más contenido.</p>
        <p className="mt-2">Puede contener formularios, listas, o cualquier contenido complejo.</p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setIsOpenLarge(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={() => setIsOpenLarge(false)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Guardar
          </button>
        </div>
      </Modal>
    </div>
  );
};

const meta: Meta<typeof ModalExample> = {
  title: 'UI/Modal',
  component: ModalExample,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <div>
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Abrir Modal Pequeño
        </button>
        
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Modal Pequeño"
          size="sm"
        >
          <p>Este es un modal pequeño.</p>
          <button
            onClick={() => setIsOpen(false)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Cerrar
          </button>
        </Modal>
      </div>
    );
  },
};
