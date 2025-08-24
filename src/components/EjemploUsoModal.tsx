import React, { useState } from 'react';
import SelectorRolModal from './SelectorRolModal';

// Componente de ejemplo que demuestra cómo usar el SelectorRolModal
const EjemploUsoModal: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Datos de ejemplo para roles
  const rolesEjemplo = [
    { id: '1', nombre: 'Administrador', icon: '👑' },
    { id: '2', nombre: 'Investigador', icon: '🔬' },
    { id: '3', nombre: 'Reclutador', icon: '🎯' },
    { id: '4', nombre: 'Usuario', icon: '👤' },
  ];

  const abrirModal = () => {
    setIsModalOpen(true);
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
  };

  const handleRolSeleccionado = (rol: any) => {
    console.log('Rol seleccionado en ejemplo:', rol);
    // Aquí puedes agregar lógica adicional cuando se selecciona un rol
    alert(`Rol seleccionado: ${rol.nombre}`);
  };

  return (
    <div className="bg-white rounded-lg  p-6 border border-gray-200">
              <h3 className="text-base font-semibold text-foreground mb-4">
        Ejemplo de uso del SelectorRolModal
      </h3>
      
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Este componente demuestra cómo usar el SelectorRolModal en diferentes contextos.
          El modal es completamente reutilizable y se integra con el contexto global de roles.
        </p>
        
        <div className="flex space-x-3">
          <button
            onClick={abrirModal}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors duration-200"
          >
            Abrir Modal de Roles
          </button>
          
          <button
            onClick={() => console.log('Otro botón de ejemplo')}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
          >
            Otra Acción
          </button>
        </div>
        
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium text-foreground mb-2">Características del Modal:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Reutilizable y configurable</li>
            <li>• Integración automática con RolContext</li>
            <li>• Cierre automático al seleccionar rol</li>
            <li>• Diseño responsive y accesible</li>
            <li>• Iconos automáticos según el tipo de rol</li>
            <li>• Callback personalizable al seleccionar rol</li>
          </ul>
        </div>
      </div>

      {/* Modal de selección de roles */}
      <SelectorRolModal
        isOpen={isModalOpen}
        onClose={cerrarModal}
        roles={rolesEjemplo}
      />
    </div>
  );
};

export default EjemploUsoModal; 