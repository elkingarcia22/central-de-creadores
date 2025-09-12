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
import { PageHeader, FilterLabel } from './';
import { SaveIcon, XIcon } from '../icons';

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
    departamento_nombre: '',
    estado_participante: ''
  });

  // Estados para las opciones de los selects
  const [rolesEmpresa, setRolesEmpresa] = useState<Array<{ value: string; label: string }>>([]);
  const [empresas, setEmpresas] = useState<Array<{ value: string; label: string }>>([]);
  const [departamentos, setDepartamentos] = useState<Array<{ value: string; label: string }>>([]);
  const [estadosParticipante, setEstadosParticipante] = useState<Array<{ value: string; label: string }>>([]);

  // Cargar opciones de los selects
  useEffect(() => {
    const cargarOpciones = async () => {
      try {
        // Cargar roles de empresa
        const responseRoles = await fetch('/api/roles-empresa');
        if (responseRoles.ok) {
          const dataRoles = await responseRoles.json();
          if (Array.isArray(dataRoles)) {
            setRolesEmpresa(dataRoles.map((rol: any) => ({ value: rol.nombre, label: rol.nombre })));
          }
        }

        // Cargar empresas
        const responseEmpresas = await fetch('/api/empresas');
        if (responseEmpresas.ok) {
          const dataEmpresas = await responseEmpresas.json();
          if (Array.isArray(dataEmpresas)) {
            setEmpresas(dataEmpresas.map((empresa: any) => ({ value: empresa.nombre, label: empresa.nombre })));
          }
        }

        // Cargar departamentos
        const responseDepartamentos = await fetch('/api/departamentos');
        if (responseDepartamentos.ok) {
          const dataDepartamentos = await responseDepartamentos.json();
          let departamentosArray = [];
          if (dataDepartamentos && dataDepartamentos.departamentos && Array.isArray(dataDepartamentos.departamentos)) {
            departamentosArray = dataDepartamentos.departamentos;
          } else if (Array.isArray(dataDepartamentos)) {
            departamentosArray = dataDepartamentos;
          }
          setDepartamentos(departamentosArray.map((departamento: any) => ({ value: departamento.nombre, label: departamento.nombre })));
        }

        // Cargar estados de participante solo si es necesario
        if (participante?.tipo === 'externo') {
          const responseEstados = await fetch('/api/estados-participante');
          if (responseEstados.ok) {
            const dataEstados = await responseEstados.json();
            if (Array.isArray(dataEstados)) {
              setEstadosParticipante(dataEstados.map((estado: any) => ({ value: estado.nombre, label: estado.nombre })));
            }
          }
        }
      } catch (error) {
        console.error('Error cargando opciones:', error);
      }
    };

    if (isOpen) {
      cargarOpciones();
    }
  }, [isOpen, participante?.tipo]);

  useEffect(() => {
    if (participante) {
      setFormData({
        nombre: participante.nombre || '',
        email: participante.email || '',
        rol_empresa: participante.rol_empresa || '',
        empresa_nombre: participante.empresa_nombre || '',
        departamento_nombre: participante.departamento_nombre || '',
        estado_participante: participante.estado_participante || ''
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

  const footer = (
    <div className="flex justify-end space-x-3">
      <Button
        variant="secondary"
        onClick={onClose}
        disabled={loading}
      >
        <XIcon className="w-4 h-4 mr-2" />
        Cancelar
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        loading={loading}
        disabled={loading}
      >
        <SaveIcon className="w-4 h-4 mr-2" />
        Guardar Cambios
      </Button>
    </div>
  );

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      footer={footer}
      showCloseButton={false}
    >
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title={`Editar Participante - ${getTipoLabel(participante?.tipo)}`}
          variant="title-only"
          color="gray"
          className="mb-0 -mx-6 -mt-6"
          onClose={onClose}
        />

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <div>
              <FilterLabel>Nombre Completo</FilterLabel>
              <Input
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                placeholder="Ingresa el nombre completo"
                disabled={loading}
                required
                fullWidth
              />
            </div>

            <div>
              <FilterLabel>Email</FilterLabel>
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
              <FilterLabel>Rol en la Empresa</FilterLabel>
              <Select
                placeholder="Seleccionar rol..."
                options={rolesEmpresa}
                value={formData.rol_empresa}
                onChange={(value) => handleInputChange('rol_empresa', value)}
                disabled={loading}
                fullWidth
              />
            </div>

            {participante?.tipo === 'externo' && (
              <div>
                <FilterLabel>Estado del Participante</FilterLabel>
                <Select
                  placeholder="Seleccionar estado..."
                  options={estadosParticipante}
                  value={formData.estado_participante}
                  onChange={(value) => handleInputChange('estado_participante', value)}
                  disabled={loading}
                  fullWidth
                />
              </div>
            )}
          </div>

          {/* Información organizacional */}
          <div className="space-y-4">
            {participante?.tipo === 'externo' && (
              <div>
                <FilterLabel>Empresa</FilterLabel>
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
                <FilterLabel>Departamento</FilterLabel>
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
        </form>
      </div>
    </SideModal>
  );
}
