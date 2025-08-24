import React from 'react';
import { useRol } from '../contexts/RolContext';

const RolInfo: React.FC = () => {
  const { rolSeleccionado, rolesDisponibles, limpiarRol } = useRol();

  return (
    <div className="bg-white rounded-lg  p-6 border border-gray-200">
      <h3 className="text-base font-semibold text-foreground mb-4">
        Información del Rol (Ejemplo de uso del Contexto)
      </h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Rol Actual:</h4>
          <p className="text-primary font-semibold">
            {rolSeleccionado || 'No seleccionado'}
          </p>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Roles Disponibles:</h4>
          {rolesDisponibles.length > 0 ? (
            <ul className="list-disc list-inside text-gray-600">
              {rolesDisponibles.map((rol, index) => (
                <li key={index} className="mb-1">
                  {rol}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No hay roles disponibles</p>
          )}
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={limpiarRol}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200"
          >
            Limpiar Rol
          </button>
        </div>
      </div>
    </div>
  );
};

export default RolInfo; 