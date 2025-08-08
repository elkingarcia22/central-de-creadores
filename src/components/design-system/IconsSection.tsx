import React from 'react';
import { Typography, Card } from '../ui';
import * as Icons from '../icons';

const IconsSection: React.FC = () => {
  // Obtener todos los iconos disponibles
  const iconNames = Object.keys(Icons).filter(key => 
    key.endsWith('Icon') && typeof Icons[key as keyof typeof Icons] === 'function'
  );

  const iconCategories = {
    'Navegación': ['ArrowLeftIcon', 'ArrowRightIcon', 'ChevronDownIcon', 'ChevronUpIcon'],
    'Acciones': ['PlusIcon', 'EditIcon', 'TrashIcon', 'CopyIcon', 'SaveIcon'],
    'Usuarios': ['UserIcon', 'UserAvatarIcon', 'UsersIcon'],
    'Estado': ['CheckCircleIcon', 'AlertTriangleIcon', 'InfoIcon', 'XIcon'],
    'Navegación UI': ['HomeIcon', 'SettingsIcon', 'MenuIcon', 'SearchIcon'],
    'Otros': iconNames.filter(name => 
      !['ArrowLeftIcon', 'ArrowRightIcon', 'ChevronDownIcon', 'ChevronUpIcon', 
        'PlusIcon', 'EditIcon', 'TrashIcon', 'CopyIcon', 'SaveIcon',
        'UserIcon', 'UserAvatarIcon', 'UsersIcon',
        'CheckCircleIcon', 'AlertTriangleIcon', 'InfoIcon', 'XIcon',
        'HomeIcon', 'SettingsIcon', 'MenuIcon', 'SearchIcon'].includes(name)
    )
  };

  return (
    <div className="space-y-8">
      <div>
        <Typography variant="h2" weight="bold" className="mb-2">
          Iconografía
        </Typography>
        <Typography variant="body1" color="secondary">
          Biblioteca de iconos SVG del sistema de diseño
        </Typography>
      </div>

      {Object.entries(iconCategories).map(([category, iconList]) => (
        <Card key={category} className="p-6">
          <Typography variant="h3" weight="semibold" className="mb-4">
            {category}
          </Typography>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {iconList.map((iconName) => {
              const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<any>;
              if (!IconComponent) return null;
              
              return (
                <div key={iconName} className="flex flex-col items-center p-3 border border-border rounded-lg hover:bg-muted transition-colors">
                  <IconComponent className="w-6 h-6 mb-2" />
                  <Typography variant="caption" className="text-center">
                    {iconName.replace('Icon', '')}
                  </Typography>
                </div>
              );
            })}
          </div>
        </Card>
      ))}

      {/* Tamaños de Iconos */}
      <Card className="p-6">
        <Typography variant="h3" weight="semibold" className="mb-4">
          Tamaños de Iconos
        </Typography>
        
        <div className="space-y-4">
          <div>
            <Typography variant="subtitle2" weight="medium" className="mb-2">
              Escala de Tamaños
            </Typography>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <Icons.UserIcon className="w-4 h-4" />
                <Typography variant="caption">xs (16px)</Typography>
              </div>
              <div className="flex flex-col items-center">
                <Icons.UserIcon className="w-5 h-5" />
                <Typography variant="caption">sm (20px)</Typography>
              </div>
              <div className="flex flex-col items-center">
                <Icons.UserIcon className="w-6 h-6" />
                <Typography variant="caption">md (24px)</Typography>
              </div>
              <div className="flex flex-col items-center">
                <Icons.UserIcon className="w-8 h-8" />
                <Typography variant="caption">lg (32px)</Typography>
              </div>
              <div className="flex flex-col items-center">
                <Icons.UserIcon className="w-10 h-10" />
                <Typography variant="caption">xl (40px)</Typography>
              </div>
            </div>
          </div>
          
          <div>
            <Typography variant="subtitle2" weight="medium" className="mb-2">
              Colores de Iconos
            </Typography>
            <div className="flex items-center gap-4">
              <Icons.UserIcon className="w-6 h-6 text-foreground" />
              <Icons.UserIcon className="w-6 h-6 text-primary" />
              <Icons.UserIcon className="w-6 h-6 text-secondary" />
              <Icons.UserIcon className="w-6 h-6 text-success" />
              <Icons.UserIcon className="w-6 h-6 text-warning" />
              <Icons.UserIcon className="w-6 h-6 text-destructive" />
              <Icons.UserIcon className="w-6 h-6 text-muted-foreground" />
            </div>
          </div>
        </div>
      </Card>

      {/* Uso en Componentes */}
      <Card className="p-6">
        <Typography variant="h3" weight="semibold" className="mb-4">
          Uso en Componentes
        </Typography>
        
        <div className="space-y-4">
          <div>
            <Typography variant="subtitle2" weight="medium" className="mb-2">
              Botones con Iconos
            </Typography>
            <div className="flex flex-wrap gap-2">
              <button className="flex items-center gap-2 px-3 py-1 bg-primary text-primary-foreground rounded text-sm">
                <Icons.PlusIcon className="w-4 h-4" />
                Agregar
              </button>
              <button className="flex items-center gap-2 px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm">
                <Icons.EditIcon className="w-4 h-4" />
                Editar
              </button>
              <button className="flex items-center gap-2 px-3 py-1 bg-destructive text-destructive-foreground rounded text-sm">
                <Icons.TrashIcon className="w-4 h-4" />
                Eliminar
              </button>
            </div>
          </div>
          
          <div>
            <Typography variant="subtitle2" weight="medium" className="mb-2">
              Estados con Iconos
            </Typography>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-success">
                <Icons.CheckCircleIcon className="w-5 h-5" />
                <span>Completado</span>
              </div>
              <div className="flex items-center gap-2 text-warning">
                <Icons.AlertTriangleIcon className="w-5 h-5" />
                <span>Advertencia</span>
              </div>
              <div className="flex items-center gap-2 text-destructive">
                <Icons.XIcon className="w-5 h-5" />
                <span>Error</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default IconsSection;
