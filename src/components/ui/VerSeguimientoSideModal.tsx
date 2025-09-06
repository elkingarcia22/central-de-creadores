import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import SideModal from './SideModal';
import Button from './Button';
import Typography from './Typography';
import { PageHeader } from './';
import { InfoContainer, InfoItem } from './InfoContainer';
import { ClipboardListIcon, UserIcon, CalendarIcon, FileTextIcon, BuildingIcon, ClockIcon } from '../icons';
import { formatearFecha } from '../../utils/fechas';
import { getChipVariant } from '../../utils/chipUtils';
import Chip from './Chip';

interface Seguimiento {
  id: string;
  investigacion_id: string;
  investigacion_nombre: string;
  responsable_id: string;
  responsable_nombre: string;
  fecha_seguimiento: string;
  notas: string;
  estado: string;
  participante_externo_id: string;
  participante_externo: {
    id: string;
    nombre: string;
    email: string;
    empresa_nombre?: string;
  };
  creado_el: string;
}

interface VerSeguimientoSideModalProps {
  isOpen: boolean;
  onClose: () => void;
  seguimiento: Seguimiento | null;
}

const VerSeguimientoSideModal: React.FC<VerSeguimientoSideModalProps> = ({
  isOpen,
  onClose,
  seguimiento
}) => {
  const { theme } = useTheme();

  if (!seguimiento) {
    return null;
  }

  const footer = (
    <div className="flex gap-3">
      <Button
        variant="secondary"
        onClick={onClose}
      >
        Cerrar
      </Button>
    </div>
  );

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      width="lg"
      footer={footer}
      showCloseButton={false}
    >
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Ver Seguimiento"
          variant="title-only"
          color="gray"
          className="mb-0 -mx-6 -mt-6"
          onClose={onClose}
          icon={<ClipboardListIcon className="w-5 h-5" />}
        />

        {/* Información del Participante */}
        {seguimiento.participante_externo && (
          <InfoContainer 
            title="Participante Asociado" 
            icon={<UserIcon className="w-4 h-4" />}
          >
            <InfoItem 
              label="Nombre" 
              value={seguimiento.participante_externo.nombre}
              size="lg"
            />
            {seguimiento.participante_externo.empresa_nombre && (
              <InfoItem 
                label="Empresa" 
                value={seguimiento.participante_externo.empresa_nombre}
                size="lg"
              />
            )}
            {seguimiento.participante_externo.email && (
              <InfoItem 
                label="Email" 
                value={seguimiento.participante_externo.email}
                size="lg"
              />
            )}
          </InfoContainer>
        )}

        {/* Información del Seguimiento */}
        <InfoContainer 
          title="Información del Seguimiento" 
          icon={<ClipboardListIcon className="w-4 h-4" />}
        >
          <InfoItem 
            label="Investigación" 
            value={seguimiento.investigacion_nombre}
            size="lg"
          />
          <InfoItem 
            label="ID Investigación" 
            value={`${seguimiento.investigacion_id.substring(0, 8)}...`}
            size="lg"
          />
          <InfoItem 
            label="Estado" 
            value={<Chip variant={getChipVariant(seguimiento.estado)} size="sm">{seguimiento.estado}</Chip>}
            size="lg"
          />
          <InfoItem 
            label="Responsable" 
            value={seguimiento.responsable_nombre}
            size="lg"
          />
        </InfoContainer>

        {/* Fechas */}
        <InfoContainer 
          title="Fechas" 
          icon={<ClockIcon className="w-4 h-4" />}
        >
          <InfoItem 
            label="Fecha de Seguimiento" 
            value={formatearFecha(seguimiento.fecha_seguimiento)}
            size="lg"
          />
          <InfoItem 
            label="Fecha de Creación" 
            value={formatearFecha(seguimiento.creado_el)}
            size="lg"
          />
        </InfoContainer>

        {/* Notas */}
        {seguimiento.notas && (
          <InfoContainer 
            title="Notas del Seguimiento" 
            icon={<FileTextIcon className="w-4 h-4" />}
          >
            <InfoItem 
              label="Descripción" 
              value={seguimiento.notas}
              size="lg"
            />
          </InfoContainer>
        )}
      </div>
    </SideModal>
  );
};

export default VerSeguimientoSideModal;
