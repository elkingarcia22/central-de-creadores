import React, { useState, useEffect } from 'react';
import { Select } from '../components/ui/Select';

const TestSelectDebug: React.FC = () => {
  const [selectedValue, setSelectedValue] = useState('');
  const [debugInfo, setDebugInfo] = useState({
    bodyClassName: '',
    isDarkMode: false,
    isClient: false
  });

  const testOptions = [
    { value: 'opcion1', label: 'Opción 1' },
    { value: 'opcion2', label: 'Opción 2' },
    { value: 'opcion3', label: 'Opción 3' },
    { value: 'opcion4', label: 'Opción 4' },
  ];

  useEffect(() => {
    setDebugInfo({
      bodyClassName: document.body.className,
      isDarkMode: document.documentElement.classList.contains('dark'),
      isClient: true
    });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-foreground">
          Test de Debug - Select Component
        </h1>
        
        {/* Información del tema actual */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Información del Tema</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Variable --background:</strong>
              <div 
                className="w-8 h-8 border border-border mt-1"
                style={{ backgroundColor: 'rgb(var(--background))' }}
              />
              <code className="text-xs text-muted-foreground">
                rgb(var(--background))
              </code>
            </div>
            <div>
              <strong>Variable --card:</strong>
              <div 
                className="w-8 h-8 border border-border mt-1"
                style={{ backgroundColor: 'rgb(var(--card))' }}
              />
              <code className="text-xs text-muted-foreground">
                rgb(var(--card))
              </code>
            </div>
            <div>
              <strong>Variable --popover:</strong>
              <div 
                className="w-8 h-8 border border-border mt-1"
                style={{ backgroundColor: 'rgb(var(--popover))' }}
              />
              <code className="text-xs text-muted-foreground">
                rgb(var(--popover))
              </code>
            </div>
            <div>
              <strong>Variable --border:</strong>
              <div 
                className="w-8 h-8 border-2 mt-1"
                style={{ borderColor: 'rgb(var(--border))' }}
              />
              <code className="text-xs text-muted-foreground">
                rgb(var(--border))
              </code>
            </div>
          </div>
        </div>

        {/* Test 1: Select normal */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Test 1: Select Normal</h2>
          <Select
            options={testOptions}
            value={selectedValue}
            onChange={setSelectedValue}
            placeholder="Seleccionar opción..."
            label="Seleccionar una opción"
            className="w-64"
          />
        </div>

        {/* Test 2: Select con estilos inline forzados */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Test 2: Select con Estilos Inline</h2>
          <div className="relative w-64">
            <select 
              className="w-full p-2 border rounded-md"
              style={{
                backgroundColor: 'rgb(var(--background))',
                color: 'rgb(var(--foreground))',
                borderColor: 'rgb(var(--border))'
              }}
            >
              <option value="">Seleccionar opción...</option>
              {testOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Test 3: Div con estilos de dropdown */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Test 3: Div con Estilos de Dropdown</h2>
          <div 
            className="w-64 border rounded-md p-2"
            style={{
              backgroundColor: 'rgb(var(--background))',
              color: 'rgb(var(--foreground))',
              borderColor: 'rgb(var(--border))'
            }}
          >
            <div className="text-sm font-medium mb-2">Dropdown Test</div>
            {testOptions.map(option => (
              <div 
                key={option.value}
                className="p-2 hover:bg-accent cursor-pointer rounded"
                style={{
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgb(var(--accent))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>

        {/* Test 4: Clases de Tailwind directas */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Test 4: Clases Tailwind Directas</h2>
          <div className="w-64 bg-background border border-border rounded-md p-2">
            <div className="text-sm font-medium mb-2 text-foreground">Tailwind Classes Test</div>
            {testOptions.map(option => (
              <div 
                key={option.value}
                className="p-2 hover:bg-accent cursor-pointer rounded text-foreground"
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>

        {/* Debug info */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Debug Info</h2>
          <div className="text-sm space-y-2">
            <div><strong>Cliente renderizado:</strong> <code>{debugInfo.isClient ? 'Sí' : 'No'}</code></div>
            <div><strong>Clase del body:</strong> <code>{debugInfo.bodyClassName || 'Cargando...'}</code></div>
            <div><strong>Modo oscuro activo:</strong> <code>{debugInfo.isDarkMode ? 'Sí' : 'No'}</code></div>
            <div><strong>Variable --background computada:</strong> 
              <span 
                className="ml-2 px-2 py-1 rounded text-xs"
                style={{ backgroundColor: 'rgb(var(--background))' }}
              >
                rgb(var(--background))
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSelectDebug;
