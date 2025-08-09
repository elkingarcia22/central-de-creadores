import React, { useState } from 'react';
import { Typography, Card } from '../ui';
import { ChevronDownIcon, ChevronRightIcon, PlusIcon, EditIcon, TrashIcon, SaveIcon } from '../icons';

// Componente Button específico para el sistema de diseño con estilos hardcodeados
interface DesignSystemButtonProps {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  iconOnly?: boolean;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  theme?: "light" | "dark";
}

const DesignSystemButton: React.FC<DesignSystemButtonProps> = ({ 
  children, 
  variant = "primary", 
  size = "md",
  icon,
  iconPosition = "left",
  iconOnly = false,
  loading = false,
  disabled = false,
  className = "",
  onClick,
  type = "button",
  theme = "light",
  ...props 
}) => { 
  const baseClasses = "rounded-md font-medium transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"; 
  
  // Estilos hardcodeados para modo claro
  const lightVariantClasses = { 
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600", 
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-300", 
    outline: "border border-gray-300 bg-transparent text-gray-900 hover:bg-gray-50 focus:ring-gray-300",
    ghost: "bg-transparent text-gray-900 hover:bg-gray-100 focus:ring-gray-300",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
  }; 

  // Estilos hardcodeados para modo oscuro
  const darkVariantClasses = { 
    primary: "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500", 
    secondary: "bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500", 
    outline: "border border-gray-400 bg-transparent text-white hover:bg-gray-800 focus:ring-gray-400",
    ghost: "bg-transparent text-white hover:bg-gray-800 focus:ring-gray-300",
    destructive: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500"
  }; 
  
  const sizeClasses = { 
    sm: iconOnly ? "w-8 h-8" : "px-3 py-1.5 text-sm gap-1.5", 
    md: iconOnly ? "w-10 h-10" : "px-4 py-2 gap-2", 
    lg: iconOnly ? "w-12 h-12" : "px-6 py-3 text-lg gap-2.5" 
  }; 

  const iconSizeClasses = {
    sm: "w-4 h-4",
    md: "w-4 h-4", 
    lg: "w-5 h-5"
  };

  const variantClasses = theme === "dark" ? darkVariantClasses : lightVariantClasses;
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`; 

  const renderIcon = () => {
    if (loading) {
      return (
        <svg className={`animate-spin ${iconSizeClasses[size]}`} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      );
    }
    
    if (icon) {
      return React.cloneElement(icon as React.ReactElement, {
        className: iconSizeClasses[size]
      });
    }
    
    return null;
  };

  const renderContent = () => {
    if (iconOnly) {
      return renderIcon();
    }

    const iconElement = renderIcon();
    
    if (!iconElement) {
      return children;
    }

    if (iconPosition === "right") {
      return (
        <>
          {children}
          {iconElement}
        </>
      );
    }

    return (
      <>
        {iconElement}
        {children}
      </>
    );
  };

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

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
                  <div 
                    className="p-6 rounded-lg border border-border"
                    style={{ backgroundColor: 'rgb(248 250 252)' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Typography variant="subtitle2" weight="medium" style={{ color: "rgb(15 23 42)" }}>
                        Modo Claro
                      </Typography>
                    </div>
                    <div className="space-y-3">
                      <DesignSystemButton variant={variant.variant} theme="light">
                        {variant.label}
                      </DesignSystemButton>
                    </div>
                  </div>

                  {/* Modo Oscuro */}
                  <div 
                    className="p-6 rounded-lg border border-border"
                    style={{ backgroundColor: 'rgb(10 10 10)' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Typography variant="subtitle2" weight="medium" style={{ color: 'rgb(250 250 250)' }}>
                        Modo Oscuro
                      </Typography>
                    </div>
                    <div className="space-y-3">
                      <DesignSystemButton variant={variant.variant} theme="dark">
                        {variant.label}
                      </DesignSystemButton>
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
                  <div 
                    className="p-6 rounded-lg border border-border"
                    style={{ backgroundColor: 'rgb(248 250 252)' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Typography variant="subtitle2" weight="medium" style={{ color: "rgb(15 23 42)" }}>
                        Modo Claro
                      </Typography>
                    </div>
                    <div className="space-y-3">
                      <DesignSystemButton variant="primary" size={size.size} theme="light">
                        {size.label}
                      </DesignSystemButton>
                    </div>
                  </div>

                  {/* Modo Oscuro */}
                  <div 
                    className="p-6 rounded-lg border border-border"
                    style={{ backgroundColor: 'rgb(10 10 10)' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Typography variant="subtitle2" weight="medium" style={{ color: 'rgb(250 250 250)' }}>
                        Modo Oscuro
                      </Typography>
                    </div>
                    <div className="space-y-3">
                      <DesignSystemButton variant="primary" size={size.size} theme="dark">
                        {size.label}
                      </DesignSystemButton>
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
                  <div 
                    className="p-6 rounded-lg border border-border"
                    style={{ backgroundColor: 'rgb(248 250 252)' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Typography variant="subtitle2" weight="medium" style={{ color: "rgb(15 23 42)" }}>
                        Modo Claro
                      </Typography>
                    </div>
                    <div className="space-y-3">
                      <DesignSystemButton 
                        variant="primary"
                        icon={example.icon}
                        iconPosition={example.iconPosition}
                        iconOnly={example.iconOnly}
                        loading={example.loading}
                        disabled={example.disabled}
                        theme="light"
                      >
                        {!example.iconOnly && example.name}
                      </DesignSystemButton>
                    </div>
                  </div>

                  {/* Modo Oscuro */}
                  <div 
                    className="p-6 rounded-lg border border-border"
                    style={{ backgroundColor: 'rgb(10 10 10)' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Typography variant="subtitle2" weight="medium" style={{ color: 'rgb(250 250 250)' }}>
                        Modo Oscuro
                      </Typography>
                    </div>
                    <div className="space-y-3">
                      <DesignSystemButton 
                        variant="primary"
                        icon={example.icon}
                        iconPosition={example.iconPosition}
                        iconOnly={example.iconOnly}
                        loading={example.loading}
                        disabled={example.disabled}
                        theme="dark"
                      >
                        {!example.iconOnly && example.name}
                      </DesignSystemButton>
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
