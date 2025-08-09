import React from 'react';
import { Typography, Card, Chip } from '../ui';

const ColorsSectionNew: React.FC = () => {
  const colorTokens = [
    { 
      name: 'primary', 
      light: 'rgb(12 91 239)', 
      dark: 'rgb(70 107 211)', 
      description: 'Color principal de la marca',
      lightBg: 'rgb(248 250 252)',
      darkBg: 'rgb(10 10 10)'
    },
    { 
      name: 'secondary', 
      light: 'rgb(241 245 249)', 
      dark: 'rgb(39 39 42)', 
      description: 'Color secundario',
      lightBg: 'rgb(248 250 252)',
      darkBg: 'rgb(10 10 10)'
    },
    { 
      name: 'success', 
      light: 'rgb(22 163 74)', 
      dark: 'rgb(120 220 150)', 
      description: 'Estados de éxito',
      lightBg: 'rgb(248 250 252)',
      darkBg: 'rgb(10 10 10)'
    },
    { 
      name: 'warning', 
      light: 'rgb(234 179 8)', 
      dark: 'rgb(255 210 100)', 
      description: 'Estados de advertencia',
      lightBg: 'rgb(248 250 252)',
      darkBg: 'rgb(10 10 10)'
    },
    { 
      name: 'destructive', 
      light: 'rgb(220 38 38)', 
      dark: 'rgb(255 140 140)', 
      description: 'Estados de error',
      lightBg: 'rgb(248 250 252)',
      darkBg: 'rgb(10 10 10)'
    },
    { 
      name: 'info', 
      light: 'rgb(96 165 250)', 
      dark: 'rgb(96 165 250)', 
      description: 'Información',
      lightBg: 'rgb(248 250 252)',
      darkBg: 'rgb(10 10 10)'
    },
    { 
      name: 'background', 
      light: 'rgb(248 250 252)', 
      dark: 'rgb(10 10 10)', 
      description: 'Fondo principal',
      lightBg: 'rgb(255 255 255)',
      darkBg: 'rgb(0 0 0)'
    },
    { 
      name: 'foreground', 
      light: 'rgb(15 23 42)', 
      dark: 'rgb(250 250 250)', 
      description: 'Texto principal',
      lightBg: 'rgb(248 250 252)',
      darkBg: 'rgb(10 10 10)'
    },
    { 
      name: 'muted', 
      light: 'rgb(241 245 249)', 
      dark: 'rgb(63 63 70)', 
      description: 'Elementos atenuados',
      lightBg: 'rgb(248 250 252)',
      darkBg: 'rgb(10 10 10)'
    },
    { 
      name: 'border', 
      light: 'rgb(226 232 240)', 
      dark: 'rgb(63 63 70)', 
      description: 'Bordes',
      lightBg: 'rgb(248 250 252)',
      darkBg: 'rgb(10 10 10)'
    },
    { 
      name: 'card', 
      light: 'rgb(255 255 255)', 
      dark: 'rgb(20 20 20)', 
      description: 'Fondo de tarjetas',
      lightBg: 'rgb(248 250 252)',
      darkBg: 'rgb(10 10 10)'
    },
    { 
      name: 'popover', 
      light: 'rgb(255 255 255)', 
      dark: 'rgb(20 20 20)', 
      description: 'Fondo de popovers',
      lightBg: 'rgb(248 250 252)',
      darkBg: 'rgb(10 10 10)'
    },
    { 
      name: 'accent', 
      light: 'rgb(241 245 249)', 
      dark: 'rgb(39 39 42)', 
      description: 'Elementos de acento',
      lightBg: 'rgb(248 250 252)',
      darkBg: 'rgb(10 10 10)'
    },
    { 
      name: 'muted-foreground', 
      light: 'rgb(100 116 139)', 
      dark: 'rgb(161 161 170)', 
      description: 'Texto atenuado',
      lightBg: 'rgb(248 250 252)',
      darkBg: 'rgb(10 10 10)'
    },
    { 
      name: 'popover-foreground', 
      light: 'rgb(15 23 42)', 
      dark: 'rgb(250 250 250)', 
      description: 'Texto en popovers',
      lightBg: 'rgb(248 250 252)',
      darkBg: 'rgb(10 10 10)'
    },
    { 
      name: 'accent-foreground', 
      light: 'rgb(15 23 42)', 
      dark: 'rgb(250 250 250)', 
      description: 'Texto en elementos de acento',
      lightBg: 'rgb(248 250 252)',
      darkBg: 'rgb(10 10 10)'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <Typography variant="h2" weight="bold" className="mb-2">
          Paleta de Colores
        </Typography>
        <Typography variant="body1" color="secondary">
          Tokens de color del sistema de diseño con comparación lado a lado (claro vs oscuro)
        </Typography>
      </div>

      {/* Comparación lado a lado */}
      <div className="space-y-6">
        {colorTokens.map((token) => (
          <Card key={token.name} className="p-6">
            <div className="mb-4">
              <Typography variant="h4" weight="semibold" className="mb-1">
                {token.name}
              </Typography>
              <Typography variant="body2" color="secondary">
                {token.description}
              </Typography>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Modo Claro */}
              <div 
                className="p-6 rounded-lg border border-border"
                style={{ backgroundColor: token.lightBg }}
              >
                <div className="flex items-center justify-between mb-3">
                  <Typography variant="subtitle2" weight="medium" className="text-foreground">
                    Modo Claro
                  </Typography>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded border border-border"
                      style={{ backgroundColor: token.light }}
                    ></div>
                    <Typography variant="caption" className="font-mono text-foreground">
                      {token.light}
                    </Typography>
                  </div>
                </div>
                
                {/* Ejemplos de uso en modo claro */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-16 h-10 rounded border border-border flex items-center justify-center"
                      style={{ backgroundColor: token.light }}
                    >
                      <Typography variant="caption" className="font-medium" style={{ color: token.lightBg }}>
                        Color
                      </Typography>
                    </div>
                    <div className="flex-1">
                      <Typography variant="body2" className="text-foreground">
                        Color de fondo
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-16 h-10 rounded border border-border flex items-center justify-center"
                      style={{ backgroundColor: token.lightBg }}
                    >
                      <Typography variant="caption" className="font-medium" style={{ color: token.light }}>
                        Texto
                      </Typography>
                    </div>
                    <div className="flex-1">
                      <Typography variant="body2" className="text-foreground">
                        Color de texto
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modo Oscuro */}
              <div 
                className="p-6 rounded-lg border border-border"
                style={{ backgroundColor: token.darkBg }}
              >
                <div className="flex items-center justify-between mb-3">
                  <Typography variant="subtitle2" weight="medium" style={{ color: 'rgb(250 250 250)' }}>
                    Modo Oscuro
                  </Typography>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded border border-border"
                      style={{ backgroundColor: token.dark }}
                    ></div>
                    <Typography variant="caption" className="font-mono" style={{ color: 'rgb(250 250 250)' }}>
                      {token.dark}
                    </Typography>
                  </div>
                </div>
                
                {/* Ejemplos de uso en modo oscuro */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-16 h-10 rounded border border-border flex items-center justify-center"
                      style={{ backgroundColor: token.dark }}
                    >
                      <Typography variant="caption" className="font-medium" style={{ color: token.darkBg }}>
                        Color
                      </Typography>
                    </div>
                    <div className="flex-1">
                      <Typography variant="body2" style={{ color: 'rgb(250 250 250)' }}>
                        Color de fondo
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-16 h-10 rounded border border-border flex items-center justify-center"
                      style={{ backgroundColor: token.darkBg }}
                    >
                      <Typography variant="caption" className="font-medium" style={{ color: token.dark }}>
                        Texto
                      </Typography>
                    </div>
                    <div className="flex-1">
                      <Typography variant="body2" style={{ color: 'rgb(250 250 250)' }}>
                        Color de texto
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Ejemplos de uso en componentes */}
      <Card className="p-6">
        <Typography variant="h3" weight="semibold" className="mb-4">
          Ejemplos de Uso en Componentes
        </Typography>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-3">
            <Typography variant="subtitle2" weight="medium">Estados</Typography>
            <div className="flex flex-wrap gap-2">
              <Chip variant="success">Éxito</Chip>
              <Chip variant="warning">Advertencia</Chip>
              <Chip variant="danger">Error</Chip>
              <Chip variant="info">Info</Chip>
            </div>
          </div>
          
          <div className="space-y-3">
            <Typography variant="subtitle2" weight="medium">Botones</Typography>
            <div className="flex flex-wrap gap-2">
              <button className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm">Primario</button>
              <button className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm">Secundario</button>
            </div>
          </div>
          
          <div className="space-y-3">
            <Typography variant="subtitle2" weight="medium">Fondos</Typography>
            <div className="space-y-2">
              <div className="h-8 bg-background border border-border rounded flex items-center justify-center">
                <Typography variant="caption">Background</Typography>
              </div>
              <div className="h-8 bg-card border border-border rounded flex items-center justify-center">
                <Typography variant="caption">Card</Typography>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Typography variant="subtitle2" weight="medium">Texto</Typography>
            <div className="space-y-2">
              <div className="text-foreground">Texto principal</div>
              <div className="text-muted-foreground">Texto secundario</div>
              <div className="text-popover-foreground">Texto en popover</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ColorsSectionNew;
