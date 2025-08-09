import React from 'react';
import { Typography, Card, Chip } from '../ui';

const ColorsSection: React.FC = () => {
  const colorTokens = [
    { name: 'primary', light: 'rgb(37 99 235)', dark: 'rgb(120 160 255)', description: 'Color principal de la marca' },
    { name: 'secondary', light: 'rgb(226 232 240)', dark: 'rgb(39 39 42)', description: 'Color secundario' },
    { name: 'success', light: 'rgb(22 163 74)', dark: 'rgb(120 220 150)', description: 'Estados de éxito' },
    { name: 'warning', light: 'rgb(234 179 8)', dark: 'rgb(255 210 100)', description: 'Estados de advertencia' },
    { name: 'destructive', light: 'rgb(220 38 38)', dark: 'rgb(255 140 140)', description: 'Estados de error' },
    { name: 'info', light: 'rgb(96 165 250)', dark: 'rgb(96 165 250)', description: 'Información' },
    { name: 'background', light: 'rgb(249 250 251)', dark: 'rgb(9 9 11)', description: 'Fondo principal' },
    { name: 'foreground', light: 'rgb(15 23 42)', dark: 'rgb(250 250 250)', description: 'Texto principal' },
    { name: 'muted', light: 'rgb(226 232 240)', dark: 'rgb(63 63 70)', description: 'Elementos atenuados' },
    { name: 'border', light: 'rgb(226 232 240)', dark: 'rgb(63 63 70)', description: 'Bordes' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <Typography variant="h2" weight="bold" className="mb-2">
          Paleta de Colores
        </Typography>
        <Typography variant="body1" color="secondary">
          Tokens de color del sistema de diseño con soporte para modo claro y oscuro
        </Typography>
      </div>

      {/* Modo Claro */}
      <Card className="p-6">
        <Typography variant="h3" weight="semibold" className="mb-4">
          Modo Claro
        </Typography>
        
        <div className="space-y-4">
          {colorTokens.map((token) => (
            <div key={token.name} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <Typography variant="subtitle2" weight="medium">
                  {token.name}
                </Typography>
                <Typography variant="caption" color="secondary">
                  {token.description}
                </Typography>
              </div>
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-8 rounded border border-border"
                  style={{ backgroundColor: token.light }}
                ></div>
                <Typography variant="caption" className="font-mono">
                  {token.light}
                </Typography>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Modo Oscuro */}
      <Card className="p-6">
        <Typography variant="h3" weight="semibold" className="mb-4">
          Modo Oscuro
        </Typography>
        
        <div className="space-y-4">
          {colorTokens.map((token) => (
            <div key={token.name} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <Typography variant="subtitle2" weight="medium">
                  {token.name}
                </Typography>
                <Typography variant="caption" color="secondary">
                  {token.description}
                </Typography>
              </div>
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-8 rounded border border-border"
                  style={{ backgroundColor: token.dark }}
                ></div>
                <Typography variant="caption" className="font-mono">
                  {token.dark}
                </Typography>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Ejemplos de uso */}
      <Card className="p-6">
        <Typography variant="h3" weight="semibold" className="mb-4">
          Ejemplos de Uso
        </Typography>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Typography variant="subtitle2" weight="medium">Estados</Typography>
            <div className="flex flex-wrap gap-2">
              <Chip variant="success">Éxito</Chip>
              <Chip variant="warning">Advertencia</Chip>
              <Chip variant="danger">Error</Chip>
              <Chip variant="info">Info</Chip>
            </div>
          </div>
          
          <div className="space-y-2">
            <Typography variant="subtitle2" weight="medium">Botones</Typography>
            <div className="flex flex-wrap gap-2">
              <button className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm">Primario</button>
              <button className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm">Secundario</button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Typography variant="subtitle2" weight="medium">Fondos</Typography>
            <div className="space-y-1">
              <div className="h-8 bg-background border border-border rounded"></div>
              <div className="h-8 bg-card border border-border rounded"></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Typography variant="subtitle2" weight="medium">Texto</Typography>
            <div className="space-y-1">
              <div className="text-foreground">Texto principal</div>
              <div className="text-muted-foreground">Texto secundario</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ColorsSection;
