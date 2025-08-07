import type { Meta, StoryObj } from '@storybook/react';

const DesignSystem = () => {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">🎨 Sistema de Diseño - Central de Creadores</h1>
      
      {/* Colores del Sistema */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6">🌈 Paleta de Colores</h2>
        
        {/* Brand Colors */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-4">Brand Colors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 border rounded-lg shadow-sm">
              <div 
                className="w-full h-20 rounded-lg mb-3" 
                style={{ backgroundColor: '#3B82F6' }}
              />
              <h4 className="font-semibold text-lg">Primary</h4>
              <p className="text-gray-600 font-mono">#3B82F6</p>
            </div>
          </div>
        </div>

        {/* Semantic Colors */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-4">Semantic Colors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 border rounded-lg shadow-sm">
              <div 
                className="w-full h-20 rounded-lg mb-3" 
                style={{ backgroundColor: '#10B981' }}
              />
              <h4 className="font-semibold text-lg">Success</h4>
              <p className="text-gray-600 font-mono">#10B981</p>
            </div>
            <div className="p-6 border rounded-lg shadow-sm">
              <div 
                className="w-full h-20 rounded-lg mb-3" 
                style={{ backgroundColor: '#EF4444' }}
              />
              <h4 className="font-semibold text-lg">Error</h4>
              <p className="text-gray-600 font-mono">#EF4444</p>
            </div>
            <div className="p-6 border rounded-lg shadow-sm">
              <div 
                className="w-full h-20 rounded-lg mb-3" 
                style={{ backgroundColor: '#F59E0B' }}
              />
              <h4 className="font-semibold text-lg">Warning</h4>
              <p className="text-gray-600 font-mono">#F59E0B</p>
            </div>
            <div className="p-6 border rounded-lg shadow-sm">
              <div 
                className="w-full h-20 rounded-lg mb-3" 
                style={{ backgroundColor: '#3B82F6' }}
              />
              <h4 className="font-semibold text-lg">Info</h4>
              <p className="text-gray-600 font-mono">#3B82F6</p>
            </div>
          </div>
        </div>

        {/* Neutral Colors */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-4">Neutral Colors</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { name: 'White', color: '#FFFFFF', textColor: '#000000' },
              { name: 'Gray 50', color: '#F9FAFB', textColor: '#000000' },
              { name: 'Gray 100', color: '#F3F4F6', textColor: '#000000' },
              { name: 'Gray 200', color: '#E5E7EB', textColor: '#000000' },
              { name: 'Gray 300', color: '#D1D5DB', textColor: '#000000' },
              { name: 'Gray 400', color: '#9CA3AF', textColor: '#000000' },
              { name: 'Gray 500', color: '#6B7280', textColor: '#FFFFFF' },
              { name: 'Gray 600', color: '#4B5563', textColor: '#FFFFFF' },
              { name: 'Gray 700', color: '#374151', textColor: '#FFFFFF' },
              { name: 'Gray 800', color: '#1F2937', textColor: '#FFFFFF' },
              { name: 'Gray 900', color: '#111827', textColor: '#FFFFFF' },
              { name: 'Black', color: '#000000', textColor: '#FFFFFF' },
            ].map(({ name, color, textColor }) => (
              <div key={name} className="p-4 border rounded-lg shadow-sm">
                <div 
                  className="w-full h-16 rounded-lg mb-2 flex items-center justify-center font-semibold" 
                  style={{ backgroundColor: color, color: textColor }}
                >
                  {name}
                </div>
                <p className="text-gray-600 font-mono text-sm">{color}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Componentes del Sistema */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6">🧩 Componentes del Sistema</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 border rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-2">UI Components</h3>
            <p className="text-gray-600 mb-3">Componentes básicos de interfaz</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Button</li>
              <li>• Input</li>
              <li>• Select</li>
              <li>• Card</li>
              <li>• Modal</li>
              <li>• Toast</li>
              <li>• Badge</li>
              <li>• Chip</li>
            </ul>
          </div>
          
          <div className="p-6 border rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Layout Components</h3>
            <p className="text-gray-600 mb-3">Componentes de estructura</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Sidebar</li>
              <li>• TopNavigation</li>
              <li>• MobileNavigation</li>
              <li>• Layout</li>
              <li>• FilterBar</li>
              <li>• ActionsMenu</li>
            </ul>
          </div>
          
          <div className="p-6 border rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Specialized Components</h3>
            <p className="text-gray-600 mb-3">Componentes especializados</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• UserSelector</li>
              <li>• UserAvatar</li>
              <li>• DataTable</li>
              <li>• ProgressBar</li>
              <li>• Tooltip</li>
              <li>• MultiSelect</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6">📊 Estadísticas del Sistema</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
            <div className="text-gray-600">Componentes Totales</div>
          </div>
          
          <div className="p-6 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">37</div>
            <div className="text-gray-600">Componentes de UI</div>
          </div>
          
          <div className="p-6 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 mb-2">13</div>
            <div className="text-gray-600">Componentes Especializados</div>
          </div>
          
          <div className="p-6 bg-orange-50 rounded-lg">
            <div className="text-3xl font-bold text-orange-600 mb-2">12</div>
            <div className="text-gray-600">Colores del Sistema</div>
          </div>
        </div>
      </section>
    </div>
  );
};

const meta: Meta<typeof DesignSystem> = {
  title: 'Design System/Overview',
  component: DesignSystem,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ColorsOnly: Story = {
  render: () => (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">🌈 Paleta de Colores</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <div className="p-4 border rounded-lg">
          <div 
            className="w-full h-16 rounded mb-2" 
            style={{ backgroundColor: '#EF4444' }}
          />
          <p className="font-semibold">Error</p>
          <p className="text-gray-600 font-mono text-sm">#EF4444</p>
        </div>
        <div className="p-4 border rounded-lg">
          <div 
            className="w-full h-16 rounded mb-2" 
            style={{ backgroundColor: '#F59E0B' }}
          />
          <p className="font-semibold">Warning</p>
          <p className="text-gray-600 font-mono text-sm">#F59E0B</p>
        </div>
      </div>
    </div>
  ),
};
