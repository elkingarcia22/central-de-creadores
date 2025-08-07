import type { Meta, StoryObj } from '@storybook/react';

const ColorSystem = () => {
  const colors = [
    { name: 'Primary', color: '#3B82F6', description: 'Color principal' },
    { name: 'Success', color: '#10B981', description: 'Color de éxito' },
    { name: 'Error', color: '#EF4444', description: 'Color de error' },
    { name: 'Warning', color: '#F59E0B', description: 'Color de advertencia' },
    { name: 'Info', color: '#3B82F6', description: 'Color de información' },
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
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center' }}>
        🎨 Sistema de Colores - Central de Creadores
      </h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px' 
      }}>
        {colors.map((colorInfo, index) => (
          <div key={index} style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: 'white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div 
              style={{ 
                width: '100%', 
                height: '80px', 
                borderRadius: '8px', 
                marginBottom: '12px',
                backgroundColor: colorInfo.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colorInfo.color === '#FFFFFF' ? '#000000' : '#FFFFFF',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              {colorInfo.name}
            </div>
            <h3 style={{ fontWeight: '600', marginBottom: '8px' }}>{colorInfo.name}</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>
              {colorInfo.description}
            </p>
            <p style={{ 
              fontFamily: 'monospace', 
              fontSize: '12px', 
              backgroundColor: '#f3f4f6', 
              padding: '4px 8px', 
              borderRadius: '4px' 
            }}>
              {colorInfo.color}
            </p>
          </div>
        ))}
      </div>
      
      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        backgroundColor: '#f9fafb', 
        borderRadius: '8px' 
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
          📋 Información del Sistema
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div>
            <h3 style={{ fontWeight: '600', marginBottom: '8px' }}>🎯 Colores Semánticos</h3>
            <ul style={{ fontSize: '14px', color: '#6b7280' }}>
              <li>• <strong>Primary:</strong> Color principal de la marca</li>
              <li>• <strong>Success:</strong> Para acciones exitosas</li>
              <li>• <strong>Error:</strong> Para errores y alertas</li>
              <li>• <strong>Warning:</strong> Para advertencias</li>
              <li>• <strong>Info:</strong> Para información</li>
            </ul>
          </div>
          <div>
            <h3 style={{ fontWeight: '600', marginBottom: '8px' }}>🎨 Escala de Grises</h3>
            <ul style={{ fontSize: '14px', color: '#6b7280' }}>
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

const meta: Meta<typeof ColorSystem> = {
  title: 'Design System/Color System',
  component: ColorSystem,
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
    <div style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
        🎯 Colores de Marca
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
          <div 
            style={{ 
              width: '100%', 
              height: '64px', 
              borderRadius: '8px', 
              marginBottom: '8px',
              backgroundColor: '#3B82F6'
            }}
          />
          <p style={{ fontWeight: '600' }}>Primary</p>
          <p style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: '12px' }}>#3B82F6</p>
        </div>
        <div style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
          <div 
            style={{ 
              width: '100%', 
              height: '64px', 
              borderRadius: '8px', 
              marginBottom: '8px',
              backgroundColor: '#10B981'
            }}
          />
          <p style={{ fontWeight: '600' }}>Success</p>
          <p style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: '12px' }}>#10B981</p>
        </div>
      </div>
    </div>
  ),
};
