import React from 'react';
import { Typography, Card, Chip } from '../ui';

const ColorsSection: React.FC = () => {
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
      description: 'Estados de éxito (Finalizado, Agendada)',
      lightBg: 'rgb(248 250 252)',
      darkBg: 'rgb(10 10 10)'
    },
    { 
      name: 'warning', 
      light: 'rgb(234 179 8)', 
      dark: 'rgb(255 210 100)', 
      description: 'Estados de advertencia (Pendiente)',
      lightBg: 'rgb(248 250 252)',
      darkBg: 'rgb(10 10 10)'
    },
    { 
      name: 'danger', 
      light: 'rgb(220 38 38)', 
      dark: 'rgb(255 140 140)', 
      description: 'Estados de error (Cancelado)',
      lightBg: 'rgb(248 250 252)',
      darkBg: 'rgb(10 10 10)'
    },
    { 
      name: 'info', 
      light: 'rgb(96 165 250)', 
      dark: 'rgb(96 165 250)', 
      description: 'Información (En Progreso - Investigación)',
      lightBg: 'rgb(248 250 252)',
      darkBg: 'rgb(10 10 10)'
    },
    { 
      name: 'accent-purple', 
      light: 'rgb(147 51 234)', 
      dark: 'rgb(147 51 234)', 
      description: 'En Progreso - Reclutamiento',
      lightBg: 'rgb(248 250 252)',
      darkBg: 'rgb(10 10 10)'
    },
    { 
      name: 'accent-orange', 
      light: 'rgb(249 115 22)', 
      dark: 'rgb(249 115 22)', 
      description: 'Por Agendar - Investigación',
      lightBg: 'rgb(248 250 252)',
      darkBg: 'rgb(10 10 10)'
    },
    { 
      name: 'accent-indigo', 
      light: 'rgb(99 102 241)', 
      dark: 'rgb(99 102 241)', 
      description: 'Por Agendar - Reclutamiento',
      lightBg: 'rgb(248 250 252)',
      darkBg: 'rgb(10 10 10)'
    },
    { 
      name: 'accent-teal', 
      light: 'rgb(20 184 166)', 
      dark: 'rgb(20 184 166)', 
      description: 'En Borrador - Investigación',
      lightBg: 'rgb(248 250 252)',
      darkBg: 'rgb(10 10 10)'
    },
    { 
      name: 'accent-pink', 
      light: 'rgb(236 72 153)', 
      dark: 'rgb(236 72 153)', 
      description: 'Pausado - Reclutamiento',
      lightBg: 'rgb(248 250 252)',
      darkBg: 'rgb(10 10 10)'
    },
    { 
      name: 'accent-cyan', 
      light: 'rgb(6 182 212)', 
      dark: 'rgb(6 182 212)', 
      description: 'Participantes Externos',
      lightBg: 'rgb(248 250 252)',
      darkBg: 'rgb(10 10 10)'
    },
    { 
      name: 'accent-emerald', 
      light: 'rgb(16 185 129)', 
      dark: 'rgb(16 185 129)', 
      description: 'Participantes Internos',
      lightBg: 'rgb(248 250 252)',
      darkBg: 'rgb(10 10 10)'
    },
    { 
      name: 'accent-violet', 
      light: 'rgb(139 92 246)', 
      dark: 'rgb(139 92 246)', 
      description: 'Participantes Friend & Family',
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
                  <Typography variant="subtitle2" weight="medium" style={{ color: "rgb(15 23 42)" }}>
                    Modo Claro
                  </Typography>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded border border-border"
                      style={{ backgroundColor: token.light }}
                    ></div>
                    <Typography variant="caption" className="font-mono" style={{ color: "rgb(15 23 42)" }}>
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
                      <Typography variant="body2" style={{ color: "rgb(15 23 42)" }}>
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
                      <Typography variant="body2" style={{ color: "rgb(15 23 42)" }}>
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
    </div>
  );
};

export default ColorsSection;
