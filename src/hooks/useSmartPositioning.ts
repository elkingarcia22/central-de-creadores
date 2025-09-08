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
    padding = 8,
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
    
    // Calcular espacio disponible con márgenes más generosos
    const spaceBelow = viewportHeight - rect.bottom - padding;
    const spaceAbove = rect.top - padding;
    
    // Determinar posición vertical - preferir abajo si hay espacio suficiente
    const minSpaceRequired = Math.min(finalDropdownHeight, 200); // Mínimo 200px o la altura del dropdown
    const showAbove = spaceBelow < minSpaceRequired && spaceAbove > spaceBelow;
    
    // Calcular posición horizontal - mantener alineado con el elemento
    let left = rect.left;
    
    // Ajustar si se sale por la derecha
    if (left + finalDropdownWidth > viewportWidth - padding) {
      left = viewportWidth - finalDropdownWidth - padding;
    }
    
    // Ajustar si se sale por la izquierda
    if (left < padding) {
      left = padding;
    }
    
    // Calcular posición vertical con márgenes apropiados
    let top: number;
    let maxHeight: number;
    
    if (showAbove) {
      // Posicionar arriba
      top = rect.top - finalDropdownHeight - 4; // 4px de separación
      maxHeight = Math.min(finalDropdownHeight, spaceAbove - 4);
      
      // Asegurar que no se salga por arriba
      if (top < padding) {
        top = padding;
        maxHeight = Math.min(finalDropdownHeight, rect.top - padding - 4);
      }
    } else {
      // Posicionar abajo
      top = rect.bottom + 4; // 4px de separación
      maxHeight = Math.min(finalDropdownHeight, spaceBelow - 4);
      
      // Asegurar que no se salga por abajo
      if (top + maxHeight > viewportHeight - padding) {
        maxHeight = viewportHeight - top - padding;
      }
    }

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${finalDropdownWidth}px`,
      maxHeight: `${Math.max(maxHeight, 100)}px`, // Mínimo 100px de altura
      zIndex: 9999
    };
  }, []);

  return { calculatePosition };
};
