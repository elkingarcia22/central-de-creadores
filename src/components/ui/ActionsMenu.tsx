import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../contexts/ThemeContext';

interface ActionItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

interface ActionsMenuProps {
  actions: ActionItem[];
  className?: string;
}

const ActionsMenu: React.FC<ActionsMenuProps> = ({ actions, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Calcular posición del menú
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const menuHeight = actions.length * 40 + 16; // Aproximadamente 40px por acción + padding
      
      // Calcular si hay espacio suficiente abajo
      const spaceBelow = viewportHeight - rect.bottom - 8;
      const spaceAbove = rect.top - 8;
      
      // Decidir si mostrar arriba o abajo
      const showAbove = spaceBelow < menuHeight && spaceAbove > spaceBelow;
      
      setMenuPosition({
        top: showAbove ? rect.top - menuHeight - 4 : rect.bottom + 4,
        left: rect.right - 192, // 192px = w-48
        width: 192
      });
    }
  }, [isOpen, actions.length]);

  const handleActionClick = (action: ActionItem) => {
    if (!action.disabled) {
      action.onClick();
      setIsOpen(false);
    }
  };

  return (
    <>
      <div className={`relative ${className}`} data-inline-edit="true">
        {/* Botón de tres puntos */}
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-md border border-border bg-card text-card-foreground hover:bg-accent flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
          aria-label="Más opciones"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </button>
      </div>

      {/* Menú desplegable usando Portal */}
      {isOpen && createPortal(
        <div
          ref={menuRef}
          className={`
            fixed z-[9999]
            bg-popover border border-border
            rounded-lg 
            py-1
          `}
          style={{
            top: menuPosition.top,
            left: menuPosition.left,
            width: menuPosition.width,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(0px)',
            isolation: 'isolate'
          }}
        >
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleActionClick(action)}
              disabled={action.disabled}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5 text-sm
                transition-colors duration-200
                ${action.disabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-accent'
                }
              `}
              style={action.className?.includes('text-red') ? {
                color: 'rgb(220 38 38) !important', // red-600
                backgroundColor: 'transparent !important'
              } : {
                color: 'rgb(var(--popover-foreground)) !important'
              }}
              onMouseEnter={action.className?.includes('text-red') ? (e) => {
                e.currentTarget.style.color = 'rgb(185 28 28) !important'; // red-700
              } : undefined}
              onMouseLeave={action.className?.includes('text-red') ? (e) => {
                e.currentTarget.style.color = 'rgb(220 38 38) !important'; // red-600
              } : undefined}
            >
              <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-current">
                {action.icon}
              </span>
              <span className="truncate">
                {action.label}
              </span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}; 

export default ActionsMenu; 