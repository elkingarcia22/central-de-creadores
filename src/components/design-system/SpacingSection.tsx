import React from 'react';
import { Typography, Card } from '../ui';

const SpacingSection: React.FC = () => {
  const spacingTokens = [
    { name: 'xs', value: '0.25rem', pixels: '4px', description: 'Espaciado muy pequeño' },
    { name: 'sm', value: '0.5rem', pixels: '8px', description: 'Espaciado pequeño' },
    { name: 'md', value: '1rem', pixels: '16px', description: 'Espaciado mediano' },
    { name: 'lg', value: '1.5rem', pixels: '24px', description: 'Espaciado grande' },
    { name: 'xl', value: '2rem', pixels: '32px', description: 'Espaciado muy grande' },
    { name: '2xl', value: '3rem', pixels: '48px', description: 'Espaciado extra grande' },
    { name: '3xl', value: '4rem', pixels: '64px', description: 'Espaciado triple extra grande' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <Typography variant="h2" weight="bold" className="mb-2">
          Sistema de Espaciado
        </Typography>
        <Typography variant="body1" color="secondary">
          Tokens de espaciado consistentes para mantener la armonía visual
        </Typography>
      </div>

      {/* Tokens de Espaciado */}
      <Card className="p-6">
        <Typography variant="h3" weight="semibold" className="mb-4">
          Tokens de Espaciado
        </Typography>
        
        <div className="space-y-4">
          {spacingTokens.map((token) => (
            <div key={token.name} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <Typography variant="subtitle2" weight="medium">
                  {token.name}
                </Typography>
                <Typography variant="caption" color="secondary">
                  {token.description}
                </Typography>
              </div>
              <div className="flex items-center gap-4">
                <div 
                  className="bg-primary rounded"
                  style={{ 
                    width: token.pixels, 
                    height: token.pixels 
                  }}
                ></div>
                <div className="text-right">
                  <Typography variant="caption" className="font-mono">
                    {token.value}
                  </Typography>
                  <Typography variant="caption" className="font-mono text-muted-foreground">
                    {token.pixels}
                  </Typography>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Ejemplos de Uso */}
      <Card className="p-6">
        <Typography variant="h3" weight="semibold" className="mb-4">
          Ejemplos de Uso
        </Typography>
        
        <div className="space-y-6">
          <div>
            <Typography variant="subtitle2" weight="medium" className="mb-2">
              Espaciado entre Elementos
            </Typography>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary rounded"></div>
                <span>Gap xs (4px)</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 bg-primary rounded"></div>
                <span>Gap sm (8px)</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-4 h-4 bg-primary rounded"></div>
                <span>Gap md (16px)</span>
              </div>
            </div>
          </div>
          
          <div>
            <Typography variant="subtitle2" weight="medium" className="mb-2">
              Padding de Contenedores
            </Typography>
            <div className="space-y-2">
              <div className="p-2 bg-muted rounded">
                <Typography variant="caption">Padding xs</Typography>
              </div>
              <div className="p-4 bg-muted rounded">
                <Typography variant="caption">Padding md</Typography>
              </div>
              <div className="p-6 bg-muted rounded">
                <Typography variant="caption">Padding lg</Typography>
              </div>
            </div>
          </div>
          
          <div>
            <Typography variant="subtitle2" weight="medium" className="mb-2">
              Margins
            </Typography>
            <div className="space-y-2">
              <div className="border border-border rounded">
                <div className="m-2 bg-primary/10 rounded">
                  <Typography variant="caption" className="p-2 block">Margin xs</Typography>
                </div>
              </div>
              <div className="border border-border rounded">
                <div className="m-4 bg-primary/10 rounded">
                  <Typography variant="caption" className="p-2 block">Margin md</Typography>
                </div>
              </div>
              <div className="border border-border rounded">
                <div className="m-6 bg-primary/10 rounded">
                  <Typography variant="caption" className="p-2 block">Margin lg</Typography>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Grid System */}
      <Card className="p-6">
        <Typography variant="h3" weight="semibold" className="mb-4">
          Sistema de Grid
        </Typography>
        
        <div className="space-y-4">
          <div>
            <Typography variant="subtitle2" weight="medium" className="mb-2">
              Columnas Responsivas
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded">
                <Typography variant="caption">Columna 1</Typography>
              </div>
              <div className="p-4 bg-muted rounded">
                <Typography variant="caption">Columna 2</Typography>
              </div>
              <div className="p-4 bg-muted rounded">
                <Typography variant="caption">Columna 3</Typography>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SpacingSection;
