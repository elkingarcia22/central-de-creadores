import React, { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useSmartPositioning } from '../../hooks/useSmartPositioning';

interface SmartDropdownProps {
  isOpen: boolean;
  triggerRef: React.RefObject<HTMLElement>;
  children: ReactNode;
  dropdownHeight?: number;
  dropdownWidth?: number;
  padding?: number;
  minWidth?: number;
  maxWidth?: number;
  className?: string;
  onClose?: () => void;
}

const SmartDropdown: React.FC<SmartDropdownProps> = ({
  isOpen,
  triggerRef,
  children,
  dropdownHeight = 300,
  dropdownWidth = 280,
  padding = 10,
  minWidth = 200,
  maxWidth = 400,
  className = '',
  onClose
}) => {
  const { calculatePosition } = useSmartPositioning();

  if (!isOpen) return null;

  const position = calculatePosition({
    elementRef: triggerRef,
    dropdownHeight,
    dropdownWidth,
    padding,
    minWidth,
    maxWidth
  });

  return createPortal(
    <>
      {/* Backdrop para cerrar al hacer clic fuera */}
      <div
        className="fixed inset-0 z-[9998]"
        onClick={onClose}
      />
      
      {/* Dropdown */}
      <div
        className={`bg-background border border-border rounded-lg shadow-lg overflow-hidden z-[9999] ${className}`}
        style={position}
      >
        {children}
      </div>
    </>,
    document.body
  );
};

export default SmartDropdown;
