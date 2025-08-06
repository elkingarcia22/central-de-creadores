import React, { useState, useRef, useEffect } from 'react';

// Función simple para combinar clases CSS
const cn = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top', 
  delay = 300,
  className 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = triggerRect.top - tooltipRect.height - 8;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'bottom':
          top = triggerRect.bottom + 8;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.left - tooltipRect.width - 8;
          break;
        case 'right':
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.right + 8;
          break;
      }

      // Ajustes para mantener el tooltip dentro de la ventana
      const padding = 8;
      if (left < padding) left = padding;
      if (left + tooltipRect.width > window.innerWidth - padding) {
        left = window.innerWidth - tooltipRect.width - padding;
      }
      if (top < padding) top = padding;
      if (top + tooltipRect.height > window.innerHeight - padding) {
        top = window.innerHeight - tooltipRect.height - padding;
      }

      setTooltipPosition({ top, left });
    }
  }, [isVisible, position]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const tooltipStyles = {
    position: 'fixed' as const,
    top: tooltipPosition.top,
    left: tooltipPosition.left,
    zIndex: 9999,
    padding: '6px 12px',
    backgroundColor: 'rgb(15, 23, 42)', // slate-900
    color: 'rgb(248, 250, 252)', // slate-50
    fontSize: '12px',
    fontWeight: '500',
    borderRadius: '6px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    maxWidth: '200px',
    wordWrap: 'break-word' as const,
    opacity: isVisible ? 1 : 0,
    transform: `scale(${isVisible ? 1 : 0.95})`,
    transition: 'opacity 0.15s ease, transform 0.15s ease',
    pointerEvents: 'none' as const,
  };

  // Estilos para la flecha
  const getArrowStyles = () => {
    const arrowSize = 6;
    const baseArrowStyles = {
      position: 'absolute' as const,
      width: 0,
      height: 0,
      borderStyle: 'solid',
    };

    switch (position) {
      case 'top':
        return {
          ...baseArrowStyles,
          top: '100%',
          left: '50%',
          marginLeft: -arrowSize,
          borderWidth: `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`,
          borderColor: 'rgb(15, 23, 42) transparent transparent transparent',
        };
      case 'bottom':
        return {
          ...baseArrowStyles,
          bottom: '100%',
          left: '50%',
          marginLeft: -arrowSize,
          borderWidth: `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`,
          borderColor: 'transparent transparent rgb(15, 23, 42) transparent',
        };
      case 'left':
        return {
          ...baseArrowStyles,
          top: '50%',
          left: '100%',
          marginTop: -arrowSize,
          borderWidth: `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`,
          borderColor: 'transparent transparent transparent rgb(15, 23, 42)',
        };
      case 'right':
        return {
          ...baseArrowStyles,
          top: '50%',
          right: '100%',
          marginTop: -arrowSize,
          borderWidth: `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`,
          borderColor: 'transparent rgb(15, 23, 42) transparent transparent',
        };
      default:
        return {};
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className={cn('inline-block', className)}
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          style={tooltipStyles}
          className={cn(
            'fixed z-50 px-3 py-1.5 text-xs font-medium text-slate-50 bg-slate-900 rounded-md shadow-lg max-w-xs',
            'opacity-100 scale-100 transition-all duration-150 ease-out'
          )}
        >
          {content}
          <div style={getArrowStyles()} />
        </div>
      )}
    </>
  );
};

export default Tooltip;
export type { TooltipProps }; 