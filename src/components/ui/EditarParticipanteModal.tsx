import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { 
  SideModal, 
  Typography, 
  Button, 
  Input, 
  Select, 
  Textarea
} from './index';
import { SaveIcon } from '../icons';

interface EditarParticipanteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  participante?: any;
}

export default function EditarParticipanteModal({
  isOpen,
  onClose,
  onSuccess,
  participante
}: EditarParticipanteModalProps) {
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    rol_empresa: '',
    empresa_nombre: '',
    departamento_nombre: ''
  });

  // Estados para las opciones de los selects
  const [rolesEmpresa, setRolesEmpresa] = useState<Array<{ value: string; label: string }>>([]);
  const [empresas, setEmpresas] = useState<Array<{ value: string; label: string }>>([]);
  const [departamentos, setDepartamentos] = useState<Array<{ value: string; label: string }>>([]);

  // Cargar opciones de los selects
  useEffect(() => {
    const cargarOpciones = async () => {
      try {
        // Cargar roles de empresa
        const responseRoles = await fetch('/api/roles-empresa');
        if (responseRoles.ok) {
          const dataRoles = await responseRoles.json();
          setRolesEmpresa(dataRoles.map((rol: any) => ({ value: rol.nombre, label: rol.nombre })));
        }

        // Cargar empresas
        const responseEmpresas = await fetch('/api/empresas');
        if (responseEmpresas.ok) {
          const dataEmpresas = await responseEmpresas.json();
          setEmpresas(dataEmpresas.map((empresa: any) => ({ value: empresa.nombre, label: empresa.nombre })));
        }

        // Cargar departamentos
        const responseDepartamentos = await fetch('/api/departamentos');
        if (responseDepartamentos.ok) {
          const dataDepartamentos = await responseDepartamentos.json();
          setDepartamentos(dataDepartamentos.map((departamento: any) => ({ value: departamento.nombre, label: departamento.nombre })));
        }
      } catch (error) {
        console.error('Error cargando opciones:', error);
      }
    };

    if (isOpen) {
      cargarOpciones();
    }
  }, [isOpen]);

  useEffect(() => {
    if (participante) {
      setFormData({
        nombre: participante.nombre || '',
        email: participante.email || '',
        rol_empresa: participante.rol_empresa || '',
        empresa_nombre: participante.empresa_nombre || '',
        departamento_nombre: participante.departamento_nombre || ''
      });
    }
  }, [participante]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      showError('El nombre es obligatorio');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`/api/participantes/${participante?.id}/editar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showSuccess('Participante actualizado exitosamente');
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Error al actualizar participante');
      }
    } catch (error) {
      console.error('Error actualizando participante:', error);
      showError('Error al actualizar participante');
    } finally {
      setLoading(false);
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'externo': return 'Cliente Externo';
      case 'interno': return 'Cliente Interno';
      case 'friend_family': return 'Friend and Family';
      default: return tipo;
    }
  };

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Editar Participante - ${getTipoLabel(participante?.tipo)}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <div className="space-y-4">
          <Typography variant="h4" weight="medium">
            Información Básica
          </Typography>
          
          <div>
            <Typography variant="subtitle2" weight="medium" className="mb-2">
              Nombre Completo *
            </Typography>
            <Input
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              placeholder="Ingresa el nombre completo"
              disabled={loading}
              fullWidth
            />
          </div>

          <div>
            <Typography variant="subtitle2" weight="medium" className="mb-2">
              Email
            </Typography>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Ingresa el email"
              disabled={loading}
              fullWidth
            />
          </div>

          <div>
            <Typography variant="subtitle2" weight="medium" className="mb-2">
              Rol en la Empresa
            </Typography>
            <Select
              placeholder="Seleccionar rol..."
              options={rolesEmpresa}
              value={formData.rol_empresa}
              onChange={(value) => handleInputChange('rol_empresa', value)}
              disabled={loading}
              fullWidth
            />
          </div>
        </div>

        {/* Información organizacional */}
        <div className="space-y-4">
          <Typography variant="h4" weight="medium">
            Información Organizacional
          </Typography>
          
          {participante?.tipo === 'externo' && (
            <div>
              <Typography variant="subtitle2" weight="medium" className="mb-2">
                Empresa
              </Typography>
              <Select
                placeholder="Seleccionar empresa..."
                options={empresas}
                value={formData.empresa_nombre}
                onChange={(value) => handleInputChange('empresa_nombre', value)}
                disabled={loading}
                fullWidth
              />
            </div>
          )}

          {(participante?.tipo === 'interno' || participante?.tipo === 'friend_family') && (
            <div>
              <Typography variant="subtitle2" weight="medium" className="mb-2">
                Departamento
              </Typography>
              <Select
                placeholder="Seleccionar departamento..."
                options={departamentos}
                value={formData.departamento_nombre}
                onChange={(value) => handleInputChange('departamento_nombre', value)}
                disabled={loading}
                fullWidth
              />
            </div>
          )}
        </div>

        {/* Nota sobre acciones adicionales */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <Typography variant="body2" color="secondary" className="text-center">
            💡 Los comentarios y dolores/necesidades se gestionan como acciones independientes desde el detalle del participante.
          </Typography>
        </div>

        {/* Botones */}
        <div className="flex gap-4 pt-6 border-t border-border">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <SaveIcon className="w-4 h-4" />
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </SideModal>
  );
}
