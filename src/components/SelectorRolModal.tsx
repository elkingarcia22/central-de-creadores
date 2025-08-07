import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '../contexts/ThemeContext';
import { useRol } from '../contexts/RolContext';
import { Modal, Button, Typography, Card } from '../components/ui';
import { AdministradorIcon, InvestigadorIcon, ReclutadorIcon } from '../components/login-icons';

interface SelectorRolModalProps {
  roles: Array<{ id: string; nombre: string }>;
  isOpen: boolean;
  onClose: () => void;
}

export default function SelectorRolModal({ roles, isOpen, onClose }: SelectorRolModalProps) {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const { setRolSeleccionado } = useRol();

  useEffect(() => {
    if (isOpen && roles.length > 0) {
      setSelectedRole(roles[0].id);
    }
  }, [isOpen, roles]);

  const handleConfirmRole = async () => {
    if (!selectedRole) return;

    setLoading(true);
    try {
      const selectedRoleData = roles.find(role => role.id === selectedRole);
      if (!selectedRoleData) return;

      const rolNormalizado = selectedRoleData.nombre.toLowerCase();
      
      // Actualizar el contexto de rol
      setRolSeleccionado(rolNormalizado);
      
      // Guardar en localStorage
      localStorage.setItem('rolSeleccionado', rolNormalizado);
      
      // Función para obtener el módulo principal de cada rol
      const getMainModuleForRole = (roleName: string): string => {
        const rolNorm = roleName.toLowerCase();
        switch (rolNorm) {
          case 'administrador':
            return '/investigaciones'; // Módulo principal para administrador
          case 'investigador':
            return '/investigaciones'; // Módulo principal para investigador
          case 'reclutador':
            return '/reclutamiento'; // Módulo principal para reclutador
          default:
            return `/dashboard/${rolNorm}`; // Fallback al dashboard específico
        }
      };

      // Determinar la ruta de redirección basada en la página actual
      const currentPath = router.asPath;
      let redirectPath = '/dashboard';
      
      // Si está en un dashboard específico de rol, ir al módulo principal del nuevo rol
      if (currentPath.includes('/dashboard/')) {
        redirectPath = getMainModuleForRole(rolNormalizado);
      } 
      // Si está en el dashboard genérico, ir al módulo principal del rol
      else if (currentPath === '/dashboard') {
        redirectPath = getMainModuleForRole(rolNormalizado);
      }
      // Si está en cualquier otra página, ir al módulo principal del rol
      else {
        redirectPath = getMainModuleForRole(rolNormalizado);
      }
      
      console.log('Redirigiendo desde', currentPath, 'hacia', redirectPath);
      router.replace(redirectPath);
      onClose();
    } catch (error) {
      console.error('Error al seleccionar rol:', error);
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
        return <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <span className="text-sm font-bold text-muted-foreground">{roleName[0]}</span>
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
                ? 'border-primary bg-primary/10 text-foreground ring-2 ring-primary/20'
                : 'border-border hover:border-primary/50 bg-card text-card-foreground hover:bg-muted'
            }`}
          >
            <div className={selectedRole === role.id ? 'text-primary' : 'text-muted-foreground'}>
              {getRoleIcon(role.nombre)}
            </div>
            <div className="text-left">
              <Typography 
                variant="subtitle1" 
                weight="medium" 
                className={selectedRole === role.id ? 'text-foreground' : 'text-foreground'}
              >
                {role.nombre}
              </Typography>
              <Typography variant="body2" color="secondary">
                Acceso completo a módulos de {role.nombre.toLowerCase()}
              </Typography>
            </div>
            {selectedRole === role.id && (
              <div className="ml-auto">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
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