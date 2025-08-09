import React from 'react';
import { Typography, Card } from '../ui';

const ElevationSection: React.FC = () => {
  const elevations = [
    { name: 'shadow-none', className: 'shadow-none', description: 'Sin elevación' },
    { name: 'shadow-sm', className: 'shadow-sm', description: 'Elevación pequeña' },
    { name: 'shadow-md', className: 'shadow-md', description: 'Elevación media' },
    { name: 'shadow-lg', className: 'shadow-lg', description: 'Elevación grande' },
    { name: 'shadow-xl', className: 'shadow-xl', description: 'Elevación extra grande' },
    { name: 'shadow-2xl', className: 'shadow-2xl', description: 'Elevación doble extra grande' },
    { name: 'shadow-inner', className: 'shadow-inner', description: 'Elevación interna' },
    { name: 'shadow-custom-popover', className: 'shadow-custom-popover', description: 'Elevación personalizada para popovers' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <Typography variant="h2" weight="bold" className="mb-2">
          Elevación (Sombras)
        </Typography>
        <Typography variant="body1" color="secondary">
          Define la jerarquía visual y la profundidad de los elementos de la interfaz.
        </Typography>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {elevations.map((elevation) => (
          <Card key={elevation.name} className="p-6">
            <Typography variant="h3" weight="semibold" className="mb-4">
              {elevation.name}
            </Typography>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Modo Claro */}
              <div
                className={`p-6 rounded-lg border border-border bg-background ${elevation.className}`}
              >
                <Typography variant="subtitle2" weight="medium" className="text-foreground">
                  Modo Claro
                </Typography>
                <div className="h-16 w-full bg-card rounded mt-4 flex items-center justify-center">
                  <Typography variant="body2" className="text-muted-foreground">
                    Ejemplo
                  </Typography>
                </div>
              </div>

              {/* Modo Oscuro */}
              <div
                className={`p-6 rounded-lg border border-border bg-background dark:bg-background ${elevation.className}`}
              >
                <Typography variant="subtitle2" weight="medium" className="text-foreground dark:text-foreground">
                  Modo Oscuro
                </Typography>
                <div className="h-16 w-full bg-card dark:bg-card rounded mt-4 flex items-center justify-center">
                  <Typography variant="body2" className="text-muted-foreground dark:text-muted-foreground">
                    Ejemplo
                  </Typography>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ElevationSection;
