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
  DepartamentoSelect
} from './index';

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
        onClick={handleSubmit}
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
      title="Crear Participante Interno"
      width="lg"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre *"
            value={formData.nombre}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              nombre: e.target.value
            }))}
            placeholder="Nombre del participante"
            disabled={loading}
            required
          />
          <Input
            label="Email *"
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
          <DepartamentoSelect
            label="Departamento"
            value={formData.departamentoId}
            onChange={(value) => setFormData(prev => ({
              ...prev,
              departamentoId: value
            }))}
            placeholder="Seleccionar departamento"
            disabled={loading}
            fullWidth
          />
          <Select
            label="Rol en la Empresa"
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
      </form>
    </SideModal>
  );
} 