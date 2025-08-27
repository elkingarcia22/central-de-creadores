import React from "react";

interface ButtonProps {
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
}

export const Button: React.FC<ButtonProps> = ({ 
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
  ...props 
}) => { 
  const baseClasses = "rounded-md font-medium transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"; 
  
  const variantClasses = { 
    primary: "bg-blue-500 text-white hover:bg-blue-600", 
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300", 
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
    destructive: "bg-red-500 text-white hover:bg-red-600"
  }; 
  
  const sizeClasses = { 
    sm: iconOnly ? "w-8 h-8" : "px-3 py-1.5 text-sm gap-1.5", 
    md: iconOnly ? "w-10 h-10" : "px-4 py-2 gap-2", 
    lg: iconOnly ? "w-12 h-12" : "px-6 py-3 gap-2.5 text-lg" 
  }; 

  const iconSizeClasses = {
    sm: "w-4 h-4",
    md: "w-4 h-4", 
    lg: "w-5 h-5"
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim(); 

  const renderIcon = () => {
    if (loading) {
      return (
        <svg 
          className={`animate-spin ${iconSizeClasses[size]}`} 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
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
          <span>{children}</span>
          {iconElement}
        </>
      );
    }

    return (
      <>
        {iconElement}
        <span>{children}</span>
      </>
    );
  };

  return (
    <button 
      className={classes} 
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

export default Button;
