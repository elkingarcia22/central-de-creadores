import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'elevated', 
  padding = 'md',
  className = ''
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return 'bg-card text-card-foreground shadow-lg border border-border';
      case 'outlined':
        return 'bg-card text-card-foreground border border-border';
      case 'filled':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-card text-card-foreground shadow-lg border border-border';
    }
  };

  const getPaddingStyles = () => {
    switch (padding) {
      case 'sm':
        return 'p-3';
      case 'md':
        return 'p-4';
      case 'lg':
        return 'p-6';
      case 'xl':
        return 'p-8';
      default:
        return 'p-4';
    }
  };

  return (
    <div className={`rounded-lg ${getVariantStyles()} ${getPaddingStyles()} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
