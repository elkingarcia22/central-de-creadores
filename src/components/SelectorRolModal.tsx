import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useToast } from '../contexts/ToastContext';
import { useRol } from '../contexts/RolContext';
import { Modal, Typography, Button } from './ui';
import { AdministradorIcon, InvestigadorIcon, ReclutadorIcon } from './login-icons';

interface SelectorRolModalProps {
  roles: Array<{ id: string; nombre: string }>;
  isOpen: boolean;
  onClose: () => void;
}

export default function SelectorRolModal({ roles, isOpen, onClose }: SelectorRolModalProps) {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const { setRol } = useRol();

  const handleConfirmRole = async () => {
    if (!selectedRole) return;

    setLoading(true);
    try {
      const selectedRoleData = roles.find(role => role.id === selectedRole);
      if (!selectedRoleData) {
        throw new Error('Rol no encontrado');
      }

      // Establecer el rol en el contexto
      setRol(selectedRoleData);

      // Determinar el módulo principal según el rol
      const getMainModuleForRole = (roleName: string): string => {
        const normalizedName = roleName.toLowerCase();
        switch (normalizedName) {
          case 'administrador':
            return '/investigaciones';
          case 'investigador':
            return '/investigaciones';
          case 'reclutador':
            return '/reclutamiento';
          default:
            return '/investigaciones';
        }
      };

      const mainModule = getMainModuleForRole(selectedRoleData.nombre);
      
      showSuccess(`Rol establecido: ${selectedRoleData.nombre}`);
      
      // Redirigir al módulo principal del rol
      router.push(mainModule);
      
      onClose();
    } catch (error) {
      console.error('Error al establecer rol:', error);
      showError('Error al establecer el rol seleccionado');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (roleName: string) => {
    const normalizedName = roleName.toLowerCase();
    switch (normalizedName) {
      case 'administrador':
        return <AdministradorIcon className="w-8 h-8" />;
      case 'investigador':
        return <InvestigadorIcon className="w-8 h-8" />;
      case 'reclutador':
        return <ReclutadorIcon className="w-8 h-8" />;
      default:
        return <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-600">{roleName[0]}</span>
        </div>;
    }
  };

  const footer = (
    <div className="flex space-x-3">
      <Button
        variant="outline"
        size="lg"
        onClick={onClose}
        fullWidth
      >
        Cancelar
      </Button>
      <Button
        variant="primary"
        size="lg"
        onClick={handleConfirmRole}
        loading={loading}
        disabled={!selectedRole}
        fullWidth
      >
        Continuar
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      footer={footer}
      closeOnOverlayClick={false}
      closeOnEscape={!loading}
    >
      <div className="text-center mb-6">
        <Typography variant="h3" color="title" weight="bold" className="mb-2">
          Selecciona tu rol
        </Typography>
        <Typography variant="body1" color="secondary">
          Tienes múltiples roles asignados. Selecciona con cuál quieres continuar:
        </Typography>
      </div>

      <div className="space-y-3">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => setSelectedRole(role.id)}
            className={`w-full p-4 rounded-lg border-2 transition-all duration-200 flex items-center space-x-3 ${
              selectedRole === role.id
                ? 'border-blue-500 bg-blue-50 text-gray-900 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-blue-300 bg-white text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className={selectedRole === role.id ? 'text-blue-500' : 'text-gray-500'}>
              {getRoleIcon(role.nombre)}
            </div>
            <div className="text-left">
              <Typography 
                variant="subtitle1" 
                weight="medium" 
                className={selectedRole === role.id ? 'text-gray-900' : 'text-gray-900'}
              >
                {role.nombre}
              </Typography>
              <Typography variant="body2" color="secondary">
                Acceso completo a módulos de {role.nombre.toLowerCase()}
              </Typography>
            </div>
            {selectedRole === role.id && (
              <div className="ml-auto">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </Modal>
  );
}
