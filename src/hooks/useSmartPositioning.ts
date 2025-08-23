import { useCallback } from 'react';

interface SmartPositioningOptions {
  elementRef: React.RefObject<HTMLElement>;
  dropdownHeight?: number;
  dropdownWidth?: number;
  padding?: number;
  minWidth?: number;
  maxWidth?: number;
}

interface Position {
  position: 'fixed';
  top: string;
  left: string;
  width?: string;
  maxHeight?: string;
  zIndex: number;
}

export const useSmartPositioning = () => {
  const calculatePosition = useCallback(({
    elementRef,
    dropdownHeight = 300,
    dropdownWidth = 280,
    padding = 10,
    minWidth = 200,
    maxWidth = 400
  }: SmartPositioningOptions): Position => {
    if (!elementRef.current) {
      return {
        position: 'fixed',
        top: '0px',
        left: '0px',
        zIndex: 9999
      };
    }

    const rect = elementRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Calcular dimensiones del dropdown
    const finalDropdownHeight = Math.min(dropdownHeight, viewportHeight - padding * 2);
    const finalDropdownWidth = Math.max(
      minWidth,
      Math.min(maxWidth, Math.max(dropdownWidth, rect.width))
    );
    
    // Calcular espacio disponible
    const spaceBelow = viewportHeight - rect.bottom - padding;
    const spaceAbove = rect.top - padding;
    
    // Determinar posición vertical
    const showAbove = spaceBelow < finalDropdownHeight && spaceAbove > spaceBelow;
    
    // Determinar posición horizontal
    let left = rect.left;
    if (left + finalDropdownWidth > viewportWidth) {
      left = viewportWidth - finalDropdownWidth - padding;
    }
    if (left < padding) {
      left = padding;
    }

    return {
      position: 'fixed',
      top: showAbove 
        ? `${rect.top - finalDropdownHeight - padding}px` 
        : `${rect.bottom + padding}px`,
      left: `${left}px`,
      width: `${finalDropdownWidth}px`,
      maxHeight: `${Math.min(
        finalDropdownHeight, 
        showAbove ? spaceAbove : spaceBelow
      )}px`,
      zIndex: 9999
    };
  }, []);

  return { calculatePosition };
};
