import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { SideModal } from './SideModal';
import { Button } from './Button';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Select } from './Select';
import { Typography } from './Typography';
import { UserSelectorWithAvatar } from './UserSelectorWithAvatar';
import { DatePicker } from './DatePicker';
import { CopyIcon, CloseIcon } from '../icons';
import type { SeguimientoInvestigacion } from '../../types/seguimientos';

interface ConvertirSeguimientoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConvert: (data: any) => Promise<void>;
  seguimiento: SeguimientoInvestigacion | null;
  usuarios: Array<{
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  }>;
  tiposInvestigacion: Array<{
    value: string;
    label: string;
  }>;
  periodos: Array<{
    value: string;
    label: string;
  }>;
  loading?: boolean;
}

interface InvestigacionFormData {
  nombre: string;
  descripcion: string;
  responsable_id: string;
  implementador_id: string;
  tipo_investigacion_id: string;
  periodo_id: string;
  fecha_inicio: string;
  fecha_fin: string;
}

export const ConvertirSeguimientoModal: React.FC<ConvertirSeguimientoModalProps> = ({
  isOpen,
  onClose,
  onConvert,
  seguimiento,
  usuarios,
  tiposInvestigacion,
  periodos,
  loading = false
}) => {
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState<InvestigacionFormData>({
    nombre: '',
    descripcion: '',
    responsable_id: '',
    implementador_id: '',
    tipo_investigacion_id: '',
    periodo_id: '',
    fecha_inicio: '',
    fecha_fin: ''
  });
  
  const [converting, setConverting] = useState(false);

  // Inicializar formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen && seguimiento) {
      const today = new Date().toISOString().split('T')[0];
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const nextMonthStr = nextMonth.toISOString().split('T')[0];

      setFormData({
        nombre: `Investigación derivada: ${seguimiento.notas.substring(0, 50)}...`,
        descripcion: seguimiento.notas,
        responsable_id: seguimiento.responsable_id,
        implementador_id: seguimiento.responsable_id,
        tipo_investigacion_id: '',
        periodo_id: '',
        fecha_inicio: today,
        fecha_fin: nextMonthStr
      });
    }
  }, [isOpen, seguimiento, periodos]);

  const handleInputChange = (field: keyof InvestigacionFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.nombre.trim()) {
      showError('El nombre de la investigación es requerido');
      return;
    }
    
    if (!formData.responsable_id) {
      showError('El responsable es requerido');
      return;
    }
    
    if (!formData.implementador_id) {
      showError('El implementador es requerido');
      return;
    }

    if (!formData.tipo_investigacion_id) {
      showError('El tipo de investigación es requerido');
      return;
    }

    setConverting(true);
    try {
      await onConvert(formData);
      onClose();
      showSuccess('Investigación creada exitosamente desde el seguimiento');
    } catch (error: any) {
      console.error('Error convirtiendo seguimiento:', error);
      showError(error.message || 'Error al crear la investigación');
    } finally {
      setConverting(false);
    }
  };

  const handleClose = () => {
    if (!converting) {
      onClose();
    }
  };

  return (
    <SideModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Convertir Seguimiento en Investigación"
      width="lg"
      footer={
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={converting}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={converting}
            disabled={converting}
            className="flex items-center gap-2"
            form="convertir-seguimiento-form"
          >
            <CopyIcon className="w-4 h-4" />
            Convertir en Investigación
          </Button>
        </div>
      }
    >
      <div className="mb-4 p-4 bg-accent rounded-lg">
        <Typography variant="subtitle2" weight="medium" className="mb-2 text-primary">
          Seguimiento Base
        </Typography>
        <Typography variant="body2" color="secondary">
          {seguimiento?.notas}
        </Typography>
      </div>

      <form id="convertir-seguimiento-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre */}
        <div>
          <Typography variant="subtitle2" weight="medium" className="mb-2">
            Nombre de la Investigación *
          </Typography>
          <Input
            value={formData.nombre}
            onChange={(e) => handleInputChange('nombre', e.target.value)}
            placeholder="Nombre de la nueva investigación"
            required
            disabled={converting}
            fullWidth
          />
        </div>

        {/* Descripción */}
        <div>
          <Typography variant="subtitle2" weight="medium" className="mb-2">
            Descripción
          </Typography>
          <Textarea
            value={formData.descripcion}
            onChange={(e) => handleInputChange('descripcion', e.target.value)}
            placeholder="Descripción detallada de la investigación"
            rows={4}
            disabled={converting}
            fullWidth
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Responsable */}
          <div>
            <Typography variant="subtitle2" weight="medium" className="mb-2">
              Responsable *
            </Typography>
            <UserSelectorWithAvatar
              value={formData.responsable_id}
              onChange={(value) => handleInputChange('responsable_id', value)}
              users={usuarios}
              placeholder="Seleccionar responsable"
              disabled={converting}
              required
            />
          </div>

          {/* Implementador */}
          <div>
            <Typography variant="subtitle2" weight="medium" className="mb-2">
              Implementador *
            </Typography>
            <UserSelectorWithAvatar
              value={formData.implementador_id}
              onChange={(value) => handleInputChange('implementador_id', value)}
              users={usuarios}
              placeholder="Seleccionar implementador"
              disabled={converting}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tipo de investigación */}
          <div>
            <Typography variant="subtitle2" weight="medium" className="mb-2">
              Tipo de Investigación *
            </Typography>
            <Select
              options={tiposInvestigacion}
              value={formData.tipo_investigacion_id}
              onChange={(value) => handleInputChange('tipo_investigacion_id', value.toString())}
              placeholder="Seleccionar tipo"
              disabled={converting}
              fullWidth
              required
            />
          </div>

          {/* Periodo */}
          <div>
            <Typography variant="subtitle2" weight="medium" className="mb-2">
              Periodo
            </Typography>
            <Select
              options={periodos}
              value={formData.periodo_id}
              onChange={(value) => handleInputChange('periodo_id', value.toString())}
              placeholder="Seleccionar periodo"
              disabled={converting}
              fullWidth
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fecha inicio */}
          <div>
            <Typography variant="subtitle2" weight="medium" className="mb-2">
              Fecha de Inicio *
            </Typography>
            <DatePicker
              value={formData.fecha_inicio}
              onChange={(e) => handleInputChange('fecha_inicio', e.target.value)}
              disabled={converting}
              required
              fullWidth
            />
          </div>
          {/* Fecha fin */}
          <div>
            <Typography variant="subtitle2" weight="medium" className="mb-2">
              Fecha de Fin *
            </Typography>
            <DatePicker
              value={formData.fecha_fin}
              onChange={(e) => handleInputChange('fecha_fin', e.target.value)}
              disabled={converting}
              required
              fullWidth
            />
          </div>
        </div>
      </form>
    </SideModal>
  );
}; 