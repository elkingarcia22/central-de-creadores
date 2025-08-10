import React, { useState } from 'react';
import { Typography, Card } from '../ui';
import { ChevronDownIcon, ChevronRightIcon, PlusIcon, EditIcon, TrashIcon, SaveIcon, SearchIcon, EmailIcon, PasswordIcon, FileTextIcon } from '../icons';

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

// Componente Input específico para el sistema de diseño con estilos hardcodeados
interface DesignSystemInputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'datetime-local' | 'time';
  placeholder?: string;
  value?: string | number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'error' | 'success';
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  label?: string;
  helperText?: string;
  error?: string;
  className?: string;
  theme?: "light" | "dark";
}

const DesignSystemInput: React.FC<DesignSystemInputProps> = ({
  type = 'text',
  placeholder,
  value,
  size = 'md',
  variant = 'default',
  disabled = false,
  readOnly = false,
  required = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  label,
  helperText,
  error,
  className = '',
  theme = "light",
  ...props
}) => {
  const baseClasses = "block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm min-h-[36px]',
    md: 'px-4 py-2 text-sm min-h-[44px]',
    lg: 'px-4 py-3 text-base min-h-[52px]'
  };

  // Estilos hardcodeados para modo claro
  const lightVariantClasses = {
    default: 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500',
    error: 'bg-white border-red-500 text-gray-900 placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500',
    success: 'bg-white border-green-500 text-gray-900 placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500'
  };

  // Estilos hardcodeados para modo oscuro
  const darkVariantClasses = {
    default: 'bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400',
    error: 'bg-gray-800 border-red-400 text-white placeholder:text-gray-400 focus:border-red-400 focus:ring-red-400',
    success: 'bg-gray-800 border-green-400 text-white placeholder:text-gray-400 focus:border-green-400 focus:ring-green-400'
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const iconPadding = icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : '';
  const variantClasses = theme === "dark" ? darkVariantClasses : lightVariantClasses;
  
  const inputClasses = [
    baseClasses,
    sizeClasses[size],
    variantClasses[error ? 'error' : variant],
    widthClass,
    iconPadding,
    className
  ].filter(Boolean).join(' ');

  const iconClasses = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const labelColor = theme === "dark" ? "text-white" : "text-gray-900";
  const helperColor = theme === "dark" ? "text-gray-400" : "text-gray-600";
  const errorColor = theme === "dark" ? "text-red-400" : "text-red-600";

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className={`block text-sm font-medium mb-0.5 ${labelColor}`}>
          {label}
          {required && <span className={`ml-1 ${errorColor}`}>*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            <span className={iconClasses}>
              {icon}
            </span>
          </div>
        )}
        
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          className={inputClasses}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div className={`absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            <span className={iconClasses}>
              {icon}
            </span>
          </div>
        )}
      </div>
      
      {(helperText || error) && (
        <p className={`text-sm mt-0.5 ${error ? errorColor : helperColor}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};


// Componente Textarea específico para el sistema de diseño con estilos hardcodeados
interface DesignSystemTextareaProps {
  placeholder?: string;
  value?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "error" | "success";
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  label?: string;
  helperText?: string;
  error?: string;
  className?: string;
  rows?: number;
  resize?: "none" | "both" | "horizontal" | "vertical";
  theme?: "light" | "dark";
}

const DesignSystemTextarea: React.FC<DesignSystemTextareaProps> = ({
  placeholder,
  value,
  size = "md",
  variant = "default",
  disabled = false,
  readOnly = false,
  required = false,
  fullWidth = false,
  label,
  helperText,
  error,
  className = "",
  rows = 3,
  resize = "vertical",
  theme = "light",
  ...props
}) => {
  const baseClasses = "block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-4 py-3 text-base"
  };
  
  // Estilos hardcodeados para modo claro
  const lightVariantClasses = {
    default: "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500",
    error: "bg-white border-red-500 text-gray-900 placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500",
    success: "bg-white border-green-500 text-gray-900 placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500"
  };
  
  // Estilos hardcodeados para modo oscuro
  const darkVariantClasses = {
    default: "bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400",
    error: "bg-gray-800 border-red-400 text-white placeholder:text-gray-400 focus:border-red-400 focus:ring-red-400",
    success: "bg-gray-800 border-green-400 text-white placeholder:text-gray-400 focus:border-green-400 focus:ring-green-400"
  };
  
  const resizeClasses = {
    none: "resize-none",
    both: "resize",
    horizontal: "resize-x",
    vertical: "resize-y"
  };
  
  const variantClasses = theme === "dark" ? darkVariantClasses : lightVariantClasses;
  const widthClass = fullWidth ? "w-full" : "";
  
  const textareaClasses = [
    baseClasses,
    sizeClasses[size],
    variantClasses[error ? "error" : variant],
    resizeClasses[resize],
    widthClass,
    className
  ].filter(Boolean).join(" ");
  
  const labelColor = theme === "dark" ? "rgb(250 250 250)" : "rgb(15 23 42)";
  const helperColor = theme === "dark" ? "rgb(161 161 170)" : "rgb(100 116 139)";
  const errorColor = theme === "dark" ? "rgb(248 113 113)" : "rgb(239 68 68)";
  
  return (
    <div className={`${fullWidth ? "w-full" : ""}`}>
      {label && (
        <label className="block text-sm font-medium mb-0.5" style={{ color: labelColor }}>
          {label}
          {required && <span style={{ color: errorColor }} className="ml-1">*</span>}
        </label>
      )}
      
      <textarea
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        rows={rows}
        className={textareaClasses}
        {...props}
      />
      
      {(helperText || error) && (
        <p className="text-sm mt-0.5" style={{ color: error ? errorColor : helperColor }}>
          {error || helperText}
        </p>
      )}
    </div>
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

  const renderInputComponent = () => {
    const inputTypes = [
      { name: 'text', label: 'Texto', type: 'text' as const, placeholder: 'Escribe algo...' },
      { name: 'email', label: 'Email', type: 'email' as const, placeholder: 'correo@ejemplo.com' },
      { name: 'password', label: 'Contraseña', type: 'password' as const, placeholder: '••••••••' },
      { name: 'search', label: 'Búsqueda', type: 'search' as const, placeholder: 'Buscar...' }
    ];

    const inputSizes = [
      { name: 'sm', label: 'Pequeño', size: 'sm' as const },
      { name: 'md', label: 'Mediano', size: 'md' as const },
      { name: 'lg', label: 'Grande', size: 'lg' as const }
    ];

    const inputVariants = [
      { name: 'default', label: 'Por defecto', variant: 'default' as const },
      { name: 'error', label: 'Error', variant: 'error' as const, error: 'Campo requerido' },
      { name: 'success', label: 'Éxito', variant: 'success' as const }
    ];

    const inputExamples = [
      { name: 'Con Icono Izquierda', icon: <SearchIcon />, iconPosition: 'left' as const },
      { name: 'Con Icono Derecha', icon: <EmailIcon />, iconPosition: 'right' as const },
      { name: 'Con Label', label: 'Nombre completo' },
      { name: 'Con Helper Text', helperText: 'Ingresa tu nombre completo' },
      { name: 'Deshabilitado', disabled: true }
    ];

    return (
      <div className="space-y-8">
        <div>
          <Typography variant="h2" weight="bold" className="mb-2">
            Input
          </Typography>
          <Typography variant="body1" color="secondary">
            Campo de entrada de datos
          </Typography>
        </div>

        {/* Tipos */}
        <Card className="p-6">
          <Typography variant="h3" weight="semibold" className="mb-4">
            Tipos
          </Typography>
          <div className="grid grid-cols-1 gap-6">
            {inputTypes.map((inputType) => (
              <Card key={inputType.name} className="p-6">
                <Typography variant="h3" weight="semibold" className="mb-4">
                  {inputType.name}
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
                      <DesignSystemInput 
                        type={inputType.type}
                        placeholder={inputType.placeholder}
                        theme="light"
                      />
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
                      <DesignSystemInput 
                        type={inputType.type}
                        placeholder={inputType.placeholder}
                        theme="dark"
                      />
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
            {inputSizes.map((size) => (
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
                      <DesignSystemInput 
                        size={size.size}
                        placeholder="Placeholder"
                        theme="light"
                      />
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
                      <DesignSystemInput 
                        size={size.size}
                        placeholder="Placeholder"
                        theme="dark"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Variantes */}
        <Card className="p-6">
          <Typography variant="h3" weight="semibold" className="mb-4">
            Variantes
          </Typography>
          <div className="grid grid-cols-1 gap-6">
            {inputVariants.map((variant) => (
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
                      <DesignSystemInput 
                        variant={variant.variant}
                        error={variant.error}
                        placeholder="Placeholder"
                        theme="light"
                      />
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
                      <DesignSystemInput 
                        variant={variant.variant}
                        error={variant.error}
                        placeholder="Placeholder"
                        theme="dark"
                      />
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
            {inputExamples.map((example, index) => (
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
                      <DesignSystemInput 
                        icon={example.icon}
                        iconPosition={example.iconPosition}
                        label={example.label}
                        helperText={example.helperText}
                        disabled={example.disabled}
                        placeholder="Placeholder"
                        theme="light"
                      />
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
                      <DesignSystemInput 
                        icon={example.icon}
                        iconPosition={example.iconPosition}
                        label={example.label}
                        helperText={example.helperText}
                        disabled={example.disabled}
                        placeholder="Placeholder"
                        theme="dark"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    );

  const renderTextareaComponent = () => {
    const textareaVariants = [
      { name: "default", label: "Por defecto", variant: "default" as const },
      { name: "error", label: "Error", variant: "error" as const, error: "Este campo es requerido" },
      { name: "success", label: "Éxito", variant: "success" as const }
    ];

    const textareaSizes = [
      { name: "Pequeño", size: "sm" as const },
      { name: "Mediano", size: "md" as const },
      { name: "Grande", size: "lg" as const }
    ];

    const textareaExamples = [
      { name: "Con Label", label: "Descripción" },
      { name: "Con Helper Text", helperText: "Describe tu experiencia en detalle" },
      { name: "Con Error", error: "Este campo es requerido" },
      { name: "Deshabilitado", disabled: true },
      { name: "Solo Lectura", readOnly: true, value: "Este texto no se puede editar" },
      { name: "Sin Redimensionar", resize: "none" as const },
      { name: "Redimensionar Horizontal", resize: "horizontal" as const },
      { name: "Redimensionar Ambos", resize: "both" as const }
    ];

    return (
      <div className="space-y-8">
        <div>
          <Typography variant="h2" weight="bold" className="mb-2">
            Área de Texto
          </Typography>
          <Typography variant="body1" color="secondary">
            Campo de texto multilínea para contenido extenso
          </Typography>
        </div>

        {/* Variantes */}
        <Card className="p-6">
          <Typography variant="h3" weight="semibold" className="mb-4">
            Variantes
          </Typography>
          <div className="grid grid-cols-1 gap-6">
            {textareaVariants.map((variant) => (
              <Card key={variant.name} className="p-6">
                <Typography variant="h3" weight="semibold" className="mb-4">
                  {variant.name}
                </Typography>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Modo Claro */}
                  <div 
                    className="p-6 rounded-lg border border-border"
                    style={{ backgroundColor: "rgb(248 250 252)" }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Typography variant="subtitle2" weight="medium" style={{ color: "rgb(15 23 42)" }}>
                        Modo Claro
                      </Typography>
                    </div>
                    <div className="space-y-3">
                      <DesignSystemTextarea 
                        variant={variant.variant}
                        error={variant.error}
                        placeholder="Escribe tu descripción aquí..."
                        theme="light"
                      />
                    </div>
                  </div>

                  {/* Modo Oscuro */}
                  <div 
                    className="p-6 rounded-lg border border-border"
                    style={{ backgroundColor: "rgb(10 10 10)" }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Typography variant="subtitle2" weight="medium" style={{ color: "rgb(250 250 250)" }}>
                        Modo Oscuro
                      </Typography>
                    </div>
                    <div className="space-y-3">
                      <DesignSystemTextarea 
                        variant={variant.variant}
                        error={variant.error}
                        placeholder="Escribe tu descripción aquí..."
                        theme="dark"
                      />
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
            {textareaSizes.map((size) => (
              <Card key={size.name} className="p-6">
                <Typography variant="h3" weight="semibold" className="mb-4">
                  {size.name}
                </Typography>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Modo Claro */}
                  <div 
                    className="p-6 rounded-lg border border-border"
                    style={{ backgroundColor: "rgb(248 250 252)" }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Typography variant="subtitle2" weight="medium" style={{ color: "rgb(15 23 42)" }}>
                        Modo Claro
                      </Typography>
                    </div>
                    <div className="space-y-3">
                      <DesignSystemTextarea 
                        size={size.size}
                        placeholder="Escribe tu descripción aquí..."
                        theme="light"
                      />
                    </div>
                  </div>

                  {/* Modo Oscuro */}
                  <div 
                    className="p-6 rounded-lg border border-border"
                    style={{ backgroundColor: "rgb(10 10 10)" }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Typography variant="subtitle2" weight="medium" style={{ color: "rgb(250 250 250)" }}>
                        Modo Oscuro
                      </Typography>
                    </div>
                    <div className="space-y-3">
                      <DesignSystemTextarea 
                        size={size.size}
                        placeholder="Escribe tu descripción aquí..."
                        theme="dark"
                      />
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
            {textareaExamples.map((example, index) => (
              <Card key={index} className="p-6">
                <Typography variant="h3" weight="semibold" className="mb-4">
                  {example.name}
                </Typography>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Modo Claro */}
                  <div 
                    className="p-6 rounded-lg border border-border"
                    style={{ backgroundColor: "rgb(248 250 252)" }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Typography variant="subtitle2" weight="medium" style={{ color: "rgb(15 23 42)" }}>
                        Modo Claro
                      </Typography>
                    </div>
                    <div className="space-y-3">
                      <DesignSystemTextarea 
                        label={example.label}
                        helperText={example.helperText}
                        error={example.error}
                        disabled={example.disabled}
                        readOnly={example.readOnly}
                        value={example.value}
                        resize={example.resize}
                        placeholder="Escribe tu descripción aquí..."
                        theme="light"
                      />
                    </div>
                  </div>

                  {/* Modo Oscuro */}
                  <div 
                    className="p-6 rounded-lg border border-border"
                    style={{ backgroundColor: "rgb(10 10 10)" }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Typography variant="subtitle2" weight="medium" style={{ color: "rgb(250 250 250)" }}>
                        Modo Oscuro
                      </Typography>
                    </div>
                    <div className="space-y-3">
                      <DesignSystemTextarea 
                        label={example.label}
                        helperText={example.helperText}
                        error={example.error}
                        disabled={example.disabled}
                        readOnly={example.readOnly}
                        value={example.value}
                        resize={example.resize}
                        placeholder="Escribe tu descripción aquí..."
                        theme="dark"
                      />
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
  };

  const renderComponentContent = () => {
    if (activeComponent === 'button') {
      return renderButtonComponent();
    }
    
    if (activeComponent === 'text-input') {
      return renderInputComponent();
    }
    
    if (activeComponent === 'textarea') {
      return renderInputComponent();
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
