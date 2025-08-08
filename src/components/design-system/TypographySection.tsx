import React from 'react';
import { Typography, Card } from '../ui';

const TypographySection: React.FC = () => {
  const typographyVariants = [
    { variant: 'display', example: 'Display Text', description: 'Títulos principales muy grandes' },
    { variant: 'h1', example: 'Heading 1', description: 'Títulos de página principales' },
    { variant: 'h2', example: 'Heading 2', description: 'Títulos de sección' },
    { variant: 'h3', example: 'Heading 3', description: 'Subtítulos importantes' },
    { variant: 'h4', example: 'Heading 4', description: 'Títulos de tarjetas' },
    { variant: 'h5', example: 'Heading 5', description: 'Títulos pequeños' },
    { variant: 'h6', example: 'Heading 6', description: 'Títulos muy pequeños' },
    { variant: 'subtitle1', example: 'Subtitle 1', description: 'Subtítulos principales' },
    { variant: 'subtitle2', example: 'Subtitle 2', description: 'Subtítulos secundarios' },
    { variant: 'body1', example: 'Body 1 text', description: 'Texto de cuerpo principal' },
    { variant: 'body2', example: 'Body 2 text', description: 'Texto de cuerpo secundario' },
    { variant: 'caption', example: 'Caption text', description: 'Texto de caption' },
    { variant: 'overline', example: 'OVERLINE TEXT', description: 'Texto de overline' },
    { variant: 'label', example: 'Label text', description: 'Etiquetas de formularios' },
    { variant: 'button', example: 'Button text', description: 'Texto de botones' },
  ];

  const weights = [
    { weight: 'thin', example: 'Thin weight' },
    { weight: 'light', example: 'Light weight' },
    { weight: 'normal', example: 'Normal weight' },
    { weight: 'medium', example: 'Medium weight' },
    { weight: 'semibold', example: 'Semibold weight' },
    { weight: 'bold', example: 'Bold weight' },
    { weight: 'extrabold', example: 'Extrabold weight' },
    { weight: 'black', example: 'Black weight' },
  ];

  const colors = [
    { color: 'default', example: 'Color por defecto' },
    { color: 'primary', example: 'Color primario' },
    { color: 'secondary', example: 'Color secundario' },
    { color: 'success', example: 'Color de éxito' },
    { color: 'warning', example: 'Color de advertencia' },
    { color: 'danger', example: 'Color de error' },
    { color: 'info', example: 'Color de información' },
    { color: 'title', example: 'Color de título' },
    { color: 'muted', example: 'Color atenuado' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <Typography variant="h2" weight="bold" className="mb-2">
          Tipografía
        </Typography>
        <Typography variant="body1" color="secondary">
          Sistema tipográfico escalable con variantes, pesos y colores
        </Typography>
      </div>

      {/* Variantes */}
      <Card className="p-6">
        <Typography variant="h3" weight="semibold" className="mb-4">
          Variantes de Texto
        </Typography>
        
        <div className="space-y-4">
          {typographyVariants.map((item) => (
            <div key={item.variant} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <Typography variant={item.variant as any} weight="medium">
                  {item.example}
                </Typography>
                <Typography variant="caption" color="secondary" className="mt-1">
                  {item.description}
                </Typography>
              </div>
              <div className="text-right">
                <Typography variant="caption" className="font-mono text-muted-foreground">
                  variant="{item.variant}"
                </Typography>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Pesos */}
      <Card className="p-6">
        <Typography variant="h3" weight="semibold" className="mb-4">
          Pesos de Fuente
        </Typography>
        
        <div className="space-y-4">
          {weights.map((item) => (
            <div key={item.weight} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <Typography variant="body1" weight={item.weight as any}>
                {item.example}
              </Typography>
              <Typography variant="caption" className="font-mono text-muted-foreground">
                weight="{item.weight}"
              </Typography>
            </div>
          ))}
        </div>
      </Card>

      {/* Colores */}
      <Card className="p-6">
        <Typography variant="h3" weight="semibold" className="mb-4">
          Colores de Texto
        </Typography>
        
        <div className="space-y-4">
          {colors.map((item) => (
            <div key={item.color} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <Typography variant="body1" color={item.color as any}>
                {item.example}
              </Typography>
              <Typography variant="caption" className="font-mono text-muted-foreground">
                color="{item.color}"
              </Typography>
            </div>
          ))}
        </div>
      </Card>

      {/* Escala Responsiva */}
      <Card className="p-6">
        <Typography variant="h3" weight="semibold" className="mb-4">
          Escala Responsiva
        </Typography>
        
        <div className="space-y-4">
          <div className="p-3 border border-border rounded-lg">
            <Typography variant="h1" className="mb-2">Título Responsivo</Typography>
            <Typography variant="body2" color="secondary">
              Se adapta automáticamente a diferentes tamaños de pantalla
            </Typography>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-3 border border-border rounded-lg">
              <Typography variant="h4" className="mb-2">Mobile</Typography>
              <Typography variant="body2" color="secondary">
                Tamaño optimizado para dispositivos móviles
              </Typography>
            </div>
            
            <div className="p-3 border border-border rounded-lg">
              <Typography variant="h4" className="mb-2">Tablet</Typography>
              <Typography variant="body2" color="secondary">
                Tamaño intermedio para tablets
              </Typography>
            </div>
            
            <div className="p-3 border border-border rounded-lg">
              <Typography variant="h4" className="mb-2">Desktop</Typography>
              <Typography variant="body2" color="secondary">
                Tamaño completo para pantallas grandes
              </Typography>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TypographySection;
