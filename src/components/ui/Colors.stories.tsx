import type { Meta, StoryObj } from '@storybook/react';

const Colors = () => {
  const colors = {
    brand: {
      primary: '#3B82F6',
    },
    semantic: {
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6',
    },
    neutral: {
      white: '#FFFFFF',
      black: '#000000',
      gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
      },
    },
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-8">🎨 Sistema de Colores - Central de Creadores</h1>
      
      {/* Brand Colors */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Brand Colors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div 
              className="w-full h-16 rounded mb-2" 
              style={{ backgroundColor: colors.brand.primary }}
            />
            <p className="font-mono text-sm">Primary</p>
            <p className="text-gray-600">{colors.brand.primary}</p>
          </div>
        </div>
      </section>

      {/* Semantic Colors */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Semantic Colors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 border rounded-lg">
            <div 
              className="w-full h-16 rounded mb-2" 
              style={{ backgroundColor: colors.semantic.success }}
            />
            <p className="font-mono text-sm">Success</p>
            <p className="text-gray-600">{colors.semantic.success}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <div 
              className="w-full h-16 rounded mb-2" 
              style={{ backgroundColor: colors.semantic.error }}
            />
            <p className="font-mono text-sm">Error</p>
            <p className="text-gray-600">{colors.semantic.error}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <div 
              className="w-full h-16 rounded mb-2" 
              style={{ backgroundColor: colors.semantic.warning }}
            />
            <p className="font-mono text-sm">Warning</p>
            <p className="text-gray-600">{colors.semantic.warning}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <div 
              className="w-full h-16 rounded mb-2" 
              style={{ backgroundColor: colors.semantic.info }}
            />
            <p className="font-mono text-sm">Info</p>
            <p className="text-gray-600">{colors.semantic.info}</p>
          </div>
        </div>
      </section>

      {/* Neutral Colors */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Neutral Colors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(colors.neutral.gray).map(([shade, color]) => (
            <div key={shade} className="p-4 border rounded-lg">
              <div 
                className="w-full h-16 rounded mb-2" 
                style={{ backgroundColor: color }}
              />
              <p className="font-mono text-sm">Gray {shade}</p>
              <p className="text-gray-600">{color}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const meta: Meta<typeof Colors> = {
  title: 'Design System/Colors',
  component: Colors,
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
      <h2 className="text-2xl font-semibold mb-4">Brand Colors</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg">
          <div 
            className="w-full h-16 rounded mb-2" 
            style={{ backgroundColor: '#3B82F6' }}
          />
          <p className="font-mono text-sm">Primary</p>
          <p className="text-gray-600">#3B82F6</p>
        </div>
      </div>
    </div>
  ),
};

export const SemanticColors: Story = {
  render: () => (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Semantic Colors</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg">
          <div 
            className="w-full h-16 rounded mb-2" 
            style={{ backgroundColor: '#10B981' }}
          />
          <p className="font-mono text-sm">Success</p>
          <p className="text-gray-600">#10B981</p>
        </div>
        <div className="p-4 border rounded-lg">
          <div 
            className="w-full h-16 rounded mb-2" 
            style={{ backgroundColor: '#EF4444' }}
          />
          <p className="font-mono text-sm">Error</p>
          <p className="text-gray-600">#EF4444</p>
        </div>
        <div className="p-4 border rounded-lg">
          <div 
            className="w-full h-16 rounded mb-2" 
            style={{ backgroundColor: '#F59E0B' }}
          />
          <p className="font-mono text-sm">Warning</p>
          <p className="text-gray-600">#F59E0B</p>
        </div>
        <div className="p-4 border rounded-lg">
          <div 
            className="w-full h-16 rounded mb-2" 
            style={{ backgroundColor: '#3B82F6' }}
          />
          <p className="font-mono text-sm">Info</p>
          <p className="text-gray-600">#3B82F6</p>
        </div>
      </div>
    </div>
  ),
};
