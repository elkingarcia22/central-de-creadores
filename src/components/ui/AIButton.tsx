import React from "react";
import { AIIcon } from "../icons";

interface AIButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit" | "reset";
}

export const AIButton: React.FC<AIButtonProps> = ({ 
  children = "Guardar y Analizar con IA",
  onClick,
  disabled = false,
  loading = false,
  size = "md",
  className = "",
  type = "button",
  ...props 
}) => {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2 gap-2",
    lg: "px-6 py-3 gap-2.5 text-lg"
  };

  const iconSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4", 
    lg: "w-5 h-5"
  };

  const baseClasses = "group relative flex items-center font-medium transition-all duration-300 rounded-md shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95 overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  
  const variantClasses = "bg-transparent border-2 border-blue-600 text-blue-600 hover:text-blue-700 hover:border-blue-700";
  
  const sizeClass = sizeClasses[size];
  const iconSizeClass = iconSizeClasses[size];

  return (
    <button 
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      className={`${baseClasses} ${variantClasses} ${sizeClass} ${className}`}
      {...props}
    >
      {/* Efecto de brillo animado */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/30 via-blue-500/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out rounded-md"></div>
      
      {/* Efecto de partículas */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute top-1 left-2 w-1 h-1 bg-blue-500/70 rounded-full animate-pulse"></div>
        <div className="absolute top-2 right-3 w-0.5 h-0.5 bg-blue-400/60 rounded-full animate-pulse delay-100"></div>
        <div className="absolute bottom-2 left-4 w-0.5 h-0.5 bg-blue-600/60 rounded-full animate-pulse delay-200"></div>
        <div className="absolute bottom-1 right-2 w-0.5 h-0.5 bg-blue-500/50 rounded-full animate-pulse delay-300"></div>
      </div>
      
      {/* Icono con efecto de brillo */}
      <div className="relative">
        {loading ? (
          <div className={`${iconSizeClass} animate-spin rounded-full border-2 border-blue-600 border-t-blue-400`}></div>
        ) : (
          <>
            <AIIcon className={`${iconSizeClass} text-blue-600 group-hover:text-blue-700 transition-colors duration-300`} />
            <div className={`absolute inset-0 ${iconSizeClass} bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
          </>
        )}
      </div>
      
      <span className="relative z-10">{children}</span>
      
      {/* Efecto de borde brillante */}
      <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-400/40 via-blue-500/30 to-blue-400/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
    </button>
  );
};
