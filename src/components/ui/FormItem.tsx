import React from 'react';
import { cn } from '../../utils/cn';

export interface FormItemProps {
  /** Contenido del elemento */
  children?: React.ReactNode;
  /** Clases CSS adicionales */
  className?: string;
  /** Layout del elemento */
  layout?: 'full' | 'half' | 'third' | 'quarter' | 'custom';
  /** Columnas personalizadas para grid */
  cols?: number;
  /** Si el elemento debe ocupar múltiples columnas */
  span?: number;
  /** Alineación del contenido */
  alignment?: 'left' | 'center' | 'right';
}

/**
 * Componente FormItem - Elemento de formulario
 * 
 * Este componente permite agrupar elementos de formulario en layouts
 * flexibles y responsivos.
 * 
 * @example
 * ```tsx
 * <FormItem layout="half">
 *   <Input label="Nombre" placeholder="Ingrese nombre" />
 * </FormItem>
 * 
 * <FormItem layout="custom" cols={3} span={2}>
 *   <Select label="Tipo" options={options} />
 * </FormItem>
 * ```
 */
export const FormItem: React.FC<FormItemProps> = ({
  children,
  className,
  layout = 'full',
  cols,
  span,
  alignment = 'left'
}) => {
  const getLayoutClasses = () => {
    switch (layout) {
      case 'half':
        return 'md:col-span-1';
      case 'third':
        return 'md:col-span-1';
      case 'quarter':
        return 'md:col-span-1';
      case 'custom':
        return span ? `md:col-span-${span}` : '';
      default:
        return 'md:col-span-full';
    }
  };

  const getGridClasses = () => {
    if (layout === 'custom' && cols) {
      return `grid grid-cols-1 md:grid-cols-${cols} gap-4`;
    }
    
    switch (layout) {
      case 'half':
        return 'grid grid-cols-1 md:grid-cols-2 gap-4';
      case 'third':
        return 'grid grid-cols-1 md:grid-cols-3 gap-4';
      case 'quarter':
        return 'grid grid-cols-1 md:grid-cols-4 gap-4';
      default:
        return '';
    }
  };

  const getAlignmentClasses = () => {
    switch (alignment) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  // Si es un contenedor de grid
  if (layout !== 'full' && layout !== 'custom') {
    return (
      <div className={cn(
        getGridClasses(),
        getAlignmentClasses(),
        className
      )}>
        {children}
      </div>
    );
  }

  // Si es un elemento individual
  return (
    <div className={cn(
      getLayoutClasses(),
      getAlignmentClasses(),
      className
    )}>
      {children}
    </div>
  );
};
