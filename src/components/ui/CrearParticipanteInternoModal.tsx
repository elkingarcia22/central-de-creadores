import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { 
  SideModal, 
  Typography, 
  Button, 
  Input, 
  Select,
  Textarea,
  DepartamentoSelect,
  PageHeader
} from './index';
import FilterLabel from './FilterLabel';
import { BuildingIcon } from '../icons';

interface CrearParticipanteInternoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (participante: any) => void;
}

interface RolEmpresa {
  id: string;
  nombre: string;
}

interface Empresa {
  id: string;
  nombre: string;
}

export default function CrearParticipanteInternoModal({
  isOpen,
  onClose,
  onSuccess
}: CrearParticipanteInternoModalProps) {
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();

  // Estados del formulario
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    departamentoId: '',
    rolEmpresaId: ''
  });

  // Estados para datos de catálogo
  const [rolesEmpresa, setRolesEmpresa] = useState<RolEmpresa[]>([]);

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      cargarDatosIniciales();
    }
  }, [isOpen]);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      await Promise.all([
        cargarRolesEmpresa()
      ]);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      showError('Error al cargar los datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  const cargarRolesEmpresa = async () => {
    try {
      const response = await fetch('/api/roles-empresa');
      if (response.ok) {
        const data = await response.json();
        setRolesEmpresa(data);
      }
    } catch (error) {
      console.error('Error cargando roles de empresa:', error);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.email) {
      showError('Por favor completa los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/participantes-internos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const nuevoParticipante = await response.json();
        showSuccess('Participante interno creado exitosamente');
        onSuccess(nuevoParticipante);
        handleClose();
      } else {
        const error = await response.json();
        showError(error.error || 'Error al crear participante interno');
      }
    } catch (error) {
      console.error('Error creando participante interno:', error);
      showError('Error al crear participante interno');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        nombre: '',
        email: '',
        departamentoId: '',
        rolEmpresaId: ''
      });
      onClose();
    }
  };

  const footer = (
    <div className="flex gap-3">
      <Button
        variant="secondary"
        onClick={handleClose}
        disabled={loading}
      >
        Cancelar
      </Button>
      <Button
        variant="primary"
        onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
        loading={loading}
        disabled={loading || !formData.nombre || !formData.email}
      >
        Crear Participante
      </Button>
    </div>
  );

  return (
    <SideModal
      isOpen={isOpen}
      onClose={handleClose}
      width="lg"
      footer={footer}
      showCloseButton={false}
    >
      <div className="flex flex-col h-full -m-6">
        {/* Header con PageHeader */}
        <PageHeader
          title="Crear Participante Interno"
          variant="title-only"
          onClose={handleClose}
          icon={<BuildingIcon className="w-5 h-5" />}
        />

        {/* Contenido del formulario */}
        <div className="flex-1 overflow-y-auto px-6">
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
        <div className="space-y-4">
          <div>
            <FilterLabel>Nombre *</FilterLabel>
            <Input
              value={formData.nombre}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                nombre: e.target.value
              }))}
              placeholder="Nombre del participante"
              disabled={loading}
              required
            />
          </div>
          <div>
            <FilterLabel>Email *</FilterLabel>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                email: e.target.value
              }))}
              placeholder="email@empresa.com"
              disabled={loading}
              required
            />
          </div>
          <div>
            <FilterLabel>Departamento</FilterLabel>
            <DepartamentoSelect
              value={formData.departamentoId}
              onChange={(value) => setFormData(prev => ({
                ...prev,
                departamentoId: value
              }))}
              placeholder="Seleccionar departamento"
              disabled={loading}
              fullWidth
            />
          </div>
          <div>
            <FilterLabel>Rol en la Empresa</FilterLabel>
            <Select
              value={formData.rolEmpresaId}
              onChange={(value) => setFormData(prev => ({
                ...prev,
                rolEmpresaId: value as string
              }))}
              placeholder="Seleccionar rol"
              options={rolesEmpresa.map(r => ({
                value: r.id,
                label: r.nombre
              }))}
              disabled={loading}
              fullWidth
            />
          </div>
        </div>
          </form>
        </div>
      </div>
    </SideModal>
  );
} 