import React, { useState } from 'react';
import { Typography, Card, Button } from '../ui';
import { ChevronDownIcon, ChevronRightIcon, PlusIcon, EditIcon, TrashIcon, SaveIcon } from '../icons';

const ComponentsSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeComponent, setActiveComponent] = useState<string | null>(null);

  const componentCategories = [
    {
      id: 'inputs',
      name: 'Inputs',
      description: 'Campos de entrada de datos',
      components: [
        { id: 'text-input', name: 'Input de Texto', description: 'Campo de texto simple' },
        { id: 'textarea', name: 'Área de Texto', description: 'Campo de texto multilínea' },
        { id: 'select', name: 'Selector', description: 'Lista desplegable' }
      ]
    },
    {
      id: 'buttons',
      name: 'Botones',
      description: 'Elementos de acción',
      components: [
        { id: 'button', name: 'Botón', description: 'Botón principal de acción' }
      ]
    }
  ];

  const renderButtonComponent = () => {
    const buttonVariants = [
      { name: 'primary', label: 'Primario', variant: 'primary' as const },
      { name: 'secondary', label: 'Secundario', variant: 'secondary' as const },
      { name: 'outline', label: 'Outline', variant: 'outline' as const },
      { name: 'ghost', label: 'Ghost', variant: 'ghost' as const },
      { name: 'destructive', label: 'Destructivo', variant: 'destructive' as const }
    ];

    const buttonSizes = [
      { name: 'sm', label: 'Pequeño', size: 'sm' as const },
      { name: 'md', label: 'Mediano', size: 'md' as const },
      { name: 'lg', label: 'Grande', size: 'lg' as const }
    ];

    const buttonExamples = [
      { name: 'Con Icono Izquierda', icon: <PlusIcon />, iconPosition: 'left' as const },
      { name: 'Con Icono Derecha', icon: <SaveIcon />, iconPosition: 'right' as const },
      { name: 'Solo Icono', icon: <EditIcon />, iconOnly: true },
      { name: 'Cargando', loading: true },
      { name: 'Deshabilitado', disabled: true }
    ];

    return (
      <div className="space-y-8">
        <div>
          <Typography variant="h2" weight="bold" className="mb-2">
            Botón
          </Typography>
          <Typography variant="body1" color="secondary">
            Componente principal para acciones y navegación
          </Typography>
        </div>

        {/* Variantes */}
        <Card className="p-6">
          <Typography variant="h3" weight="semibold" className="mb-4">
            Variantes
          </Typography>
          <div className="grid grid-cols-1 gap-6">
            {buttonVariants.map((variant) => (
              <Card key={variant.name} className="p-6">
                <Typography variant="h3" weight="semibold" className="mb-4">
                  {variant.name}
                </Typography>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Modo Claro */}
                  <div className="p-6 rounded-lg border border-border bg-background">
                    <div className="flex items-center justify-between mb-3">
                      <Typography variant="subtitle2" weight="medium" className="text-foreground">
                        Modo Claro
                      </Typography>
                    </div>
                    <div className="space-y-3">
                      <Button variant={variant.variant}>
                        {variant.label}
                      </Button>
                    </div>
                  </div>

                  {/* Modo Oscuro */}
                  <div className="p-6 rounded-lg border border-border bg-background dark:bg-background">
                    <div className="flex items-center justify-between mb-3">
                      <Typography variant="subtitle2" weight="medium" className="text-foreground dark:text-foreground">
                        Modo Oscuro
                      </Typography>
                    </div>
                    <div className="space-y-3">
                      <Button variant={variant.variant}>
                        {variant.label}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Tamaños */}
        <Card className="p-6">
          <Typography variant="h3" weight="semibold" className="mb-4">
            Tamaños
          </Typography>
          <div className="grid grid-cols-1 gap-6">
            {buttonSizes.map((size) => (
              <Card key={size.name} className="p-6">
                <Typography variant="h3" weight="semibold" className="mb-4">
                  {size.name}
                </Typography>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Modo Claro */}
                  <div className="p-6 rounded-lg border border-border bg-background">
                    <div className="flex items-center justify-between mb-3">
                      <Typography variant="subtitle2" weight="medium" className="text-foreground">
                        Modo Claro
                      </Typography>
                    </div>
                    <div className="space-y-3">
                      <Button variant="primary" size={size.size}>
                        {size.label}
                      </Button>
                    </div>
                  </div>

                  {/* Modo Oscuro */}
                  <div className="p-6 rounded-lg border border-border bg-background dark:bg-background">
                    <div className="flex items-center justify-between mb-3">
                      <Typography variant="subtitle2" weight="medium" className="text-foreground dark:text-foreground">
                        Modo Oscuro
                      </Typography>
                    </div>
                    <div className="space-y-3">
                      <Button variant="primary" size={size.size}>
                        {size.label}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Ejemplos */}
        <Card className="p-6">
          <Typography variant="h3" weight="semibold" className="mb-4">
            Ejemplos
          </Typography>
          <div className="grid grid-cols-1 gap-6">
            {buttonExamples.map((example, index) => (
              <Card key={index} className="p-6">
                <Typography variant="h3" weight="semibold" className="mb-4">
                  {example.name}
                </Typography>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Modo Claro */}
                  <div className="p-6 rounded-lg border border-border bg-background">
                    <div className="flex items-center justify-between mb-3">
                      <Typography variant="subtitle2" weight="medium" className="text-foreground">
                        Modo Claro
                      </Typography>
                    </div>
                    <div className="space-y-3">
                      <Button 
                        variant="primary"
                        icon={example.icon}
                        iconPosition={example.iconPosition}
                        iconOnly={example.iconOnly}
                        loading={example.loading}
                        disabled={example.disabled}
                      >
                        {!example.iconOnly && example.name}
                      </Button>
                    </div>
                  </div>

                  {/* Modo Oscuro */}
                  <div className="p-6 rounded-lg border border-border bg-background dark:bg-background">
                    <div className="flex items-center justify-between mb-3">
                      <Typography variant="subtitle2" weight="medium" className="text-foreground dark:text-foreground">
                        Modo Oscuro
                      </Typography>
                    </div>
                    <div className="space-y-3">
                      <Button 
                        variant="primary"
                        icon={example.icon}
                        iconPosition={example.iconPosition}
                        iconOnly={example.iconOnly}
                        loading={example.loading}
                        disabled={example.disabled}
                      >
                        {!example.iconOnly && example.name}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  const renderComponentContent = () => {
    if (activeComponent === 'button') {
      return renderButtonComponent();
    }

    return (
      <Card className="p-6 text-center">
        <Typography variant="body1" color="secondary">
          Selecciona un componente del menú para ver sus ejemplos.
        </Typography>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <Typography variant="h2" weight="bold" className="mb-2">
          Componentes
        </Typography>
        <Typography variant="body1" color="secondary">
          Biblioteca de componentes reutilizables del sistema de diseño
        </Typography>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Menú de Categorías */}
        <div className="lg:w-64 flex-shrink-0">
          <Card className="p-4 space-y-2">
            {componentCategories.map((category) => (
              <div key={category.id}>
                <button
                  onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
                  className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none"
                >
                  <span className="flex items-center gap-2">
                    {category.id === 'inputs' && <PlusIcon className="w-4 h-4" />}
                    {category.id === 'buttons' && <EditIcon className="w-4 h-4" />}
                    {category.name}
                  </span>
                  {activeCategory === category.id ? (
                    <ChevronDownIcon className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                {activeCategory === category.id && (
                  <div className="ml-4 mt-2 space-y-1">
                    {category.components.map((component) => (
                      <button
                        key={component.id}
                        onClick={() => setActiveComponent(component.id)}
                        className={`w-full px-3 py-2.5 text-sm font-medium rounded-md transition-colors text-left focus:outline-none ${
                          activeComponent === component.id
                            ? 'bg-muted text-foreground border-r-2 border-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <Typography variant="body2" weight="medium">
                          {component.name}
                        </Typography>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </Card>
        </div>

        {/* Contenido del Componente Seleccionado */}
        <div className="flex-1">
          {renderComponentContent()}
        </div>
      </div>
    </div>
  );
};

export default ComponentsSection;
