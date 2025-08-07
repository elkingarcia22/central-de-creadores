import type { Meta, StoryObj } from '@storybook/react';
import colors from '../../design-system/tokens/colors.json';
import semantic from '../../design-system/tokens/semantic.json';

const ColorPalette = () => {
  const brandColors = colors.brand;
  const semanticColors = colors.semantic;
  const neutralColors = colors.neutral;

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
              style={{ backgroundColor: brandColors.primary['500'] }}
            />
            <p className="font-mono text-sm">Primary 500</p>
            <p className="text-gray-600">{brandColors.primary['500']}</p>
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
              style={{ backgroundColor: semanticColors.success['500'] }}
            />
            <p className="font-mono text-sm">Success</p>
            <p className="text-gray-600">{semanticColors.success['500']}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <div 
              className="w-full h-16 rounded mb-2" 
              style={{ backgroundColor: semanticColors.error['500'] }}
            />
            <p className="font-mono text-sm">Error</p>
            <p className="text-gray-600">{semanticColors.error['500']}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <div 
              className="w-full h-16 rounded mb-2" 
              style={{ backgroundColor: semanticColors.warning['500'] }}
            />
            <p className="font-mono text-sm">Warning</p>
            <p className="text-gray-600">{semanticColors.warning['500']}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <div 
              className="w-full h-16 rounded mb-2" 
              style={{ backgroundColor: semanticColors.info['500'] }}
            />
            <p className="font-mono text-sm">Info</p>
            <p className="text-gray-600">{semanticColors.info['500']}</p>
          </div>
        </div>
      </section>

      {/* Neutral Colors */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Neutral Colors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(neutralColors.gray).map(([shade, color]) => (
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

      {/* Semantic Tokens */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Semantic Tokens</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Action Colors</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3B82F6' }} />
                <span className="text-sm">Primary</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#6B7280' }} />
                <span className="text-sm">Secondary</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#EF4444' }} />
                <span className="text-sm">Destructive</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Feedback Colors</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10B981' }} />
                <span className="text-sm">Success</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F59E0B' }} />
                <span className="text-sm">Warning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#EF4444' }} />
                <span className="text-sm">Error</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3B82F6' }} />
                <span className="text-sm">Info</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Surface Colors</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border" style={{ backgroundColor: '#FFFFFF' }} />
                <span className="text-sm">Background</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F9FAFB' }} />
                <span className="text-sm">Card</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FFFFFF' }} />
                <span className="text-sm">Elevated</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const meta: Meta<typeof ColorPalette> = {
  title: 'Design System/Colors',
  component: ColorPalette,
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
          <p className="font-mono text-sm">Primary 500</p>
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