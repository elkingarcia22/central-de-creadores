import React from "react";

interface RecordButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  isRecording?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit" | "reset";
}

export const RecordButton: React.FC<RecordButtonProps> = ({
  children = "Grabar",
  onClick,
  disabled = false,
  isRecording = false,
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

  const baseClasses = "group relative flex items-center font-medium transition-all duration-300 rounded-full shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95 overflow-hidden focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";

  const variantClasses = isRecording 
    ? "bg-gradient-to-l from-red-600 via-red-500 to-red-600 text-white hover:from-red-500/90 hover:via-red-400/90 hover:to-red-500/90"
    : "bg-gradient-to-l from-gray-600 via-gray-500 to-gray-600 text-white hover:from-gray-500/90 hover:via-gray-400/90 hover:to-gray-500/90";

  const sizeClass = sizeClasses[size];
  const iconSizeClass = iconSizeClasses[size];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={`${baseClasses} ${variantClasses} ${sizeClass} ${className}`}
      {...props}
    >
      {/* Efecto de brillo animado */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out rounded-full"></div>
      
      {/* Efecto de partículas */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-300">
        <div className="absolute top-1 left-2 w-1 h-1 bg-white/50 rounded-full animate-pulse"></div>
        <div className="absolute top-2 right-3 w-0.5 h-0.5 bg-white/40 rounded-full animate-pulse delay-100"></div>
        <div className="absolute bottom-2 left-4 w-0.5 h-0.5 bg-white/40 rounded-full animate-pulse delay-200"></div>
        <div className="absolute bottom-1 right-2 w-0.5 h-0.5 bg-white/30 rounded-full animate-pulse delay-300"></div>
      </div>
      
      {/* Icono de grabación */}
      <div className="relative">
        {isRecording ? (
          <div className={`${iconSizeClass} bg-white rounded-sm animate-pulse`}></div>
        ) : (
          <div className={`${iconSizeClass} border-2 border-white rounded-full`}></div>
        )}
      </div>
      
      <span className="relative z-10">{children}</span>
      
      {/* Efecto de borde brillante */}
      <div className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-300 blur-sm ${
        isRecording 
          ? "bg-gradient-to-l from-red-300/30 via-red-500/25 to-red-300/30"
          : "bg-gradient-to-l from-gray-300/30 via-gray-500/25 to-gray-300/30"
      }`}></div>
    </button>
  );
};
