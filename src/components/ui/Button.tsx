import React from "react";

export const Button = ({ 
  children, 
  variant = "primary", 
  size = "md", 
  ...props 
}) => { 
  const baseClasses = "px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-start"; 
  const variantClasses = { 
    primary: "bg-blue-500 text-white hover:bg-blue-600", 
    secondary: "bg-gray-500 text-white hover:bg-gray-600", 
    destructive: "bg-red-500 text-white hover:bg-red-600",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
  }; 
  const sizeClasses = { 
    sm: "px-3 py-1.5 text-sm", 
    md: "px-4 py-2", 
    lg: "px-6 py-3 text-lg" 
  }; 
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`; 
  return <button className={classes} {...props}>{children}</button>; 
};

export default Button;
