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
                <div className="grid grid-cols-1 gap-6">
                  {/* Modo Claro */}
                  <div className="p-6 rounded-lg border border-border" style={{ backgroundColor: 'rgb(248 250 252)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <Typography variant="subtitle2" weight="medium" style={{ color: "rgb(15 23 42)" }}>
                        Modo Claro
                      </Typography>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded border border-border" style={{ backgroundColor: 'rgb(12 91 239)' }}></div>
                        <Typography variant="caption" className="font-mono" style={{ color: "rgb(15 23 42)" }}>
                          {variant.name}
                        </Typography>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Button variant={variant.variant}>
                        {variant.label}
                      </Button>
                    </div>
                  </div>

                  {/* Modo Oscuro */}
                  <div className="p-6 rounded-lg border border-border" style={{ backgroundColor: 'rgb(10 10 10)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <Typography variant="subtitle2" weight="medium" style={{ color: 'rgb(250 250 250)' }}>
                        Modo Oscuro
                      </Typography>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded border border-border" style={{ backgroundColor: 'rgb(70 107 211)' }}></div>
                        <Typography variant="caption" className="font-mono" style={{ color: 'rgb(250 250 250)' }}>
                          {variant.name}
                        </Typography>
                      </div>
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
                <div className="grid grid-cols-1 gap-6">
                  {/* Modo Claro */}
                  <div className="p-6 rounded-lg border border-border" style={{ backgroundColor: 'rgb(248 250 252)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <Typography variant="subtitle2" weight="medium" style={{ color: "rgb(15 23 42)" }}>
                        Modo Claro
                      </Typography>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded border border-border" style={{ backgroundColor: 'rgb(12 91 239)' }}></div>
                        <Typography variant="caption" className="font-mono" style={{ color: "rgb(15 23 42)" }}>
                          {size.name}
                        </Typography>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Button variant="primary" size={size.size}>
                        {size.label}
                      </Button>
                    </div>
                  </div>

                  {/* Modo Oscuro */}
                  <div className="p-6 rounded-lg border border-border" style={{ backgroundColor: 'rgb(10 10 10)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <Typography variant="subtitle2" weight="medium" style={{ color: 'rgb(250 250 250)' }}>
                        Modo Oscuro
                      </Typography>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded border border-border" style={{ backgroundColor: 'rgb(70 107 211)' }}></div>
                        <Typography variant="caption" className="font-mono" style={{ color: 'rgb(250 250 250)' }}>
                          {size.name}
                        </Typography>
                      </div>
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
            Ejemplos de Uso
          </Typography>
          <div className="grid grid-cols-1 gap-6">
            {buttonExamples.map((example, index) => (
              <Card key={index} className="p-6">
                <Typography variant="h3" weight="semibold" className="mb-4">
                  {example.name}
                </Typography>
                <div className="grid grid-cols-1 gap-6">
                  {/* Modo Claro */}
                  <div className="p-6 rounded-lg border border-border" style={{ backgroundColor: 'rgb(248 250 252)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <Typography variant="subtitle2" weight="medium" style={{ color: "rgb(15 23 42)" }}>
                        Modo Claro
                      </Typography>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded border border-border" style={{ backgroundColor: 'rgb(12 91 239)' }}></div>
                        <Typography variant="caption" className="font-mono" style={{ color: "rgb(15 23 42)" }}>
                          {example.name}
                        </Typography>
                      </div>
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
                        {!example.iconOnly && !example.loading && example.name}
                      </Button>
                    </div>
                  </div>

                  {/* Modo Oscuro */}
                  <div className="p-6 rounded-lg border border-border" style={{ backgroundColor: 'rgb(10 10 10)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <Typography variant="subtitle2" weight="medium" style={{ color: 'rgb(250 250 250)' }}>
                        Modo Oscuro
                      </Typography>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded border border-border" style={{ backgroundColor: 'rgb(70 107 211)' }}></div>
                        <Typography variant="caption" className="font-mono" style={{ color: 'rgb(250 250 250)' }}>
                          {example.name}
                        </Typography>
                      </div>
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
                        {!example.iconOnly && !example.loading && example.name}
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
    if (!activeComponent) {
      return (
        <div className="text-center py-12">
          <Typography variant="body1" color="secondary">
            Selecciona un componente para ver sus detalles
          </Typography>
        </div>
      );
    }

    switch (activeComponent) {
      case 'button':
        return renderButtonComponent();
      default:
        return (
          <div className="text-center py-12">
            <Typography variant="body1" color="secondary">
              Componente en desarrollo
            </Typography>
          </div>
        );
    }
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card variant="default" padding="md" className="bg-card border border-slate-200 dark:border-slate-700">
            <Typography variant="h3" weight="semibold" className="mb-4 text-card-foreground">
              Categorías
            </Typography>
            <div className="space-y-1">
              {componentCategories.map((category) => (
                <div key={category.id}>
                  <button
                    onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
                    className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none"
                  >
                    <div className="text-left">
                      <Typography variant="subtitle2" weight="medium" className="text-foreground">
                        {category.name}
                      </Typography>
                      <Typography variant="caption" className="text-muted-foreground">
                        {category.description}
                      </Typography>
                    </div>
                    {activeCategory === category.id ? (
                      <ChevronDownIcon className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  
                  {activeCategory === category.id && (
                    <div className="ml-4 mt-1 space-y-1">
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
                          <Typography variant="body2" weight="medium" className="text-foreground">
                            {component.name}
                          </Typography>
                          <Typography variant="caption" className="text-muted-foreground">
                            {component.description}
                          </Typography>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {renderComponentContent()}
        </div>
      </div>
    </div>
  );
};

export default ComponentsSection;
