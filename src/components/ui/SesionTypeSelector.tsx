import React, { useState, useRef, useEffect } from 'react';
import { PlusIcon, ChevronDownIcon } from '../icons';

interface SesionTypeSelectorProps {
  onSesionInvestigacion: () => void;
  onSesionApoyo: () => void;
  className?: string;
}

export default function SesionTypeSelector({
  onSesionInvestigacion,
  onSesionApoyo,
  className = ""
}: SesionTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSesionInvestigacion = () => {
    setIsOpen(false);
    onSesionInvestigacion();
  };

  const handleSesionApoyo = () => {
    setIsOpen(false);
    onSesionApoyo();
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
      >
        <PlusIcon className="w-4 h-4" />
        Nueva Sesión
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="py-2">
            <button
              onClick={handleSesionInvestigacion}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Sesión de Investigación
            </button>
            <button
              onClick={handleSesionApoyo}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Sesión de Apoyo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
