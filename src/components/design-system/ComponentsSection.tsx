import React, { useState } from 'react';
import { Typography, Card } from '../ui';
import { ChevronDownIcon, ChevronRightIcon } from '../icons';

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
      { name: 'primary', label: 'Primario', className: 'bg-blue-500 text-white hover:bg-blue-600' },
      { name: 'secondary', label: 'Secundario', className: 'bg-gray-500 text-white hover:bg-gray-600' },
      { name: 'destructive', label: 'Destructivo', className: 'bg-red-500 text-white hover:bg-red-600' },
      { name: 'ghost', label: 'Ghost', className: 'bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800' }
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

        <Card className="p-6">
          <Typography variant="h3" weight="semibold" className="mb-4 text-card-foreground">
            Variantes
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {buttonVariants.map((variant) => (
              <div key={variant.name} className="space-y-4">
                <div className="p-6 rounded-lg border border-border" style={{ backgroundColor: 'rgb(248 250 252)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <Typography variant="subtitle2" weight="medium" style={{ color: "rgb(15 23 42)" }}>
                      Modo Claro
                    </Typography>
                    <Typography variant="caption" className="font-mono" style={{ color: "rgb(15 23 42)" }}>
                      {variant.name}
                    </Typography>
                  </div>
                  <div className="space-y-3">
                    <button className={`px-4 py-2.5 rounded-md font-medium transition-colors ${variant.className}`}>
                      {variant.label}
                    </button>
                  </div>
                </div>

                <div className="p-6 rounded-lg border border-border" style={{ backgroundColor: 'rgb(10 10 10)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <Typography variant="subtitle2" weight="medium" style={{ color: 'rgb(250 250 250)' }}>
                      Modo Oscuro
                    </Typography>
                    <Typography variant="caption" className="font-mono" style={{ color: 'rgb(250 250 250)' }}>
                      {variant.name}
                    </Typography>
                  </div>
                  <div className="space-y-3">
                    <button className={`px-4 py-2.5 rounded-md font-medium transition-colors ${variant.className}`}>
                      {variant.label}
                    </button>
                  </div>
                </div>
              </div>
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
          <Card className="p-4">
            <Typography variant="h3" weight="semibold" className="mb-4 text-card-foreground">
              Categorías
            </Typography>
            <div className="space-y-2">
              {componentCategories.map((category) => (
                <div key={category.id}>
                  <button
                    onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
                    className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-md transition-colors text-muted-foreground text-muted-foreground hover:bg-muted hover:text-foreground hover:text-foreground focus:outline-none"
                  >
                    <div>
                      <Typography variant="subtitle2" weight="medium">
                        {category.name}
                      </Typography>
                      <Typography variant="caption" color="secondary">
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
                          <Typography variant="caption" color="secondary">
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
