import React, { useState } from 'react';
import { Typography, Card } from '../ui';
import { ChevronDownIcon, ChevronRightIcon, PlusIcon, EditIcon } from '../icons';

const ComponentsSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeComponent, setActiveComponent] = useState<string | null>(null);

  const componentCategories = [
    {
      id: "inputs",
      name: "Inputs",
      components: [
        { id: "text-input", name: "Text Input" },
        { id: "textarea", name: "Textarea" },
        { id: "select", name: "Select" }
      ]
    },
    {
      id: "buttons",
      name: "Buttons",
      components: [
        { id: "button", name: "Button" }
      ]
    }
  ];

  const renderComponentContent = () => {
    if (activeComponent === 'button') {
      return (
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Button Component
          </Typography>
          <Typography variant="body1" color="secondary">
            Componente de botón con variantes y tamaños...
          </Typography>
        </Card>
      );
    }
    
    if (activeComponent === 'text-input') {
      return (
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Text Input Component
          </Typography>
          <Typography variant="body1" color="secondary">
            Componente de entrada de texto...
          </Typography>
        </Card>
      );
    }
    
    if (activeComponent === 'textarea') {
      return (
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Textarea Component
          </Typography>
          <Typography variant="body1" color="secondary">
            Componente de área de texto...
          </Typography>
        </Card>
      );
    }
    
    if (activeComponent === 'select') {
      return (
        <Card className="p-6">
          <Typography variant="h3" weight="bold" className="mb-4">
            Select Component
          </Typography>
          <Typography variant="body1" color="secondary">
            Componente de selección...
          </Typography>
        </Card>
      );
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
