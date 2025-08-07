import type { Meta, StoryObj } from '@storybook/react';

const SimpleColors = () => {
  const colors = [
    { name: 'Primary', color: '#3B82F6', description: 'Color principal de la marca' },
    { name: 'Success', color: '#10B981', description: 'Color para acciones exitosas' },
    { name: 'Error', color: '#EF4444', description: 'Color para errores y alertas' },
    { name: 'Warning', color: '#F59E0B', description: 'Color para advertencias' },
    { name: 'Info', color: '#3B82F6', description: 'Color para información' },
    { name: 'White', color: '#FFFFFF', description: 'Color blanco' },
    { name: 'Black', color: '#000000', description: 'Color negro' },
    { name: 'Gray 50', color: '#F9FAFB', description: 'Gris muy claro' },
    { name: 'Gray 100', color: '#F3F4F6', description: 'Gris claro' },
    { name: 'Gray 200', color: '#E5E7EB', description: 'Gris medio claro' },
    { name: 'Gray 300', color: '#D1D5DB', description: 'Gris medio' },
    { name: 'Gray 400', color: '#9CA3AF', description: 'Gris medio oscuro' },
    { name: 'Gray 500', color: '#6B7280', description: 'Gris oscuro' },
    { name: 'Gray 600', color: '#4B5563', description: 'Gris muy oscuro' },
    { name: 'Gray 700', color: '#374151', description: 'Gris casi negro' },
    { name: 'Gray 800', color: '#1F2937', description: 'Gris negro claro' },
    { name: 'Gray 900', color: '#111827', description: 'Gris negro' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
        🎨 Paleta de Colores - Central de Creadores
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {colors.map((colorInfo, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 border hover:shadow-lg transition-shadow">
            <div 
              className="w-full h-24 rounded-lg mb-4 flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: colorInfo.color }}
            >
              {colorInfo.name}
            </div>
            <h3 className="font-semibold text-lg mb-2">{colorInfo.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{colorInfo.description}</p>
            <p className="font-mono text-sm bg-gray-100 p-2 rounded">{colorInfo.color}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-12 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">📋 Información del Sistema de Colores</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">🎯 Colores Semánticos</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Primary:</strong> Color principal de la marca</li>
              <li>• <strong>Success:</strong> Para acciones exitosas y confirmaciones</li>
              <li>• <strong>Error:</strong> Para errores y alertas críticas</li>
              <li>• <strong>Warning:</strong> Para advertencias y alertas</li>
              <li>• <strong>Info:</strong> Para información y notificaciones</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">🎨 Escala de Grises</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>50-200:</strong> Fondos y elementos sutiles</li>
              <li>• <strong>300-500:</strong> Bordes y elementos medios</li>
              <li>• <strong>600-900:</strong> Textos y elementos importantes</li>
              <li>• <strong>White/Black:</strong> Contraste máximo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const meta: Meta<typeof SimpleColors> = {
  title: 'Design System/Simple Colors',
  component: SimpleColors,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const BrandColors: Story = {
  render: () => (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">🎯 Colores de Marca</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg">
          <div 
            className="w-full h-16 rounded mb-2" 
            style={{ backgroundColor: '#3B82F6' }}
          />
          <p className="font-semibold">Primary</p>
          <p className="text-gray-600 font-mono text-sm">#3B82F6</p>
        </div>
        <div className="p-4 border rounded-lg">
          <div 
            className="w-full h-16 rounded mb-2" 
            style={{ backgroundColor: '#10B981' }}
          />
          <p className="font-semibold">Success</p>
          <p className="text-gray-600 font-mono text-sm">#10B981</p>
        </div>
      </div>
    </div>
  ),
};
