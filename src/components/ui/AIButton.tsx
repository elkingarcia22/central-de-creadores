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

  const baseClasses = "group relative flex items-center font-medium transition-all duration-300 rounded-full shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95 overflow-hidden focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  
  const variantClasses = "bg-gradient-to-l from-purple-600 via-purple-500 to-purple-600 border-4 border-transparent text-white hover:from-purple-500 hover:via-purple-400 hover:to-purple-500";
  
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
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out rounded-full"></div>
      
      {/* Efecto de partículas */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute top-1 left-2 w-1 h-1 bg-white/70 rounded-full animate-pulse"></div>
        <div className="absolute top-2 right-3 w-0.5 h-0.5 bg-white/60 rounded-full animate-pulse delay-100"></div>
        <div className="absolute bottom-2 left-4 w-0.5 h-0.5 bg-white/60 rounded-full animate-pulse delay-200"></div>
        <div className="absolute bottom-1 right-2 w-0.5 h-0.5 bg-white/50 rounded-full animate-pulse delay-300"></div>
      </div>
      
      {/* Icono con efecto de brillo */}
      <div className="relative">
        {loading ? (
          <div className={`${iconSizeClass} animate-spin rounded-full border-2 border-white border-t-purple-300`}></div>
        ) : (
          <>
            <AIIcon className={`${iconSizeClass} text-white group-hover:text-purple-100 transition-colors duration-300`} />
            <div className={`absolute inset-0 ${iconSizeClass} bg-gradient-to-r from-white/20 to-purple-200/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
          </>
        )}
      </div>
      
      <span className="relative z-10">{children}</span>
      
      {/* Efecto de borde brillante */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-l from-purple-300/60 via-purple-500/50 to-purple-300/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
    </button>
  );
};
