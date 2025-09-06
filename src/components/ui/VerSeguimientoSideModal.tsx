import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import SideModal from './SideModal';
import Button from './Button';
import Typography from './Typography';
import { PageHeader } from './';
import FilterLabel from './FilterLabel';
import { ClipboardListIcon, UserIcon, CalendarIcon, FileTextIcon, BuildingIcon } from '../icons';
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

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      title="Ver Seguimiento"
      size="lg"
    >
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Detalles del Seguimiento"
          subtitle="Información completa del seguimiento"
          icon={<ClipboardListIcon className="w-5 h-5" />}
        />

        {/* Información del Participante */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <Typography variant="h3" weight="semibold">
                {seguimiento.participante_externo?.nombre || 'Sin participante'}
              </Typography>
              {seguimiento.participante_externo?.empresa_nombre && (
                <Typography variant="body2" className="text-muted-foreground">
                  {seguimiento.participante_externo.empresa_nombre}
                </Typography>
              )}
            </div>
          </div>
        </div>

        {/* Grid de información */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Investigación */}
          <div className="space-y-2">
            <FilterLabel>Investigación</FilterLabel>
            <div className="p-3 bg-muted/50 rounded-lg border">
              <Typography variant="body2" weight="medium">
                {seguimiento.investigacion_nombre}
              </Typography>
              <Typography variant="caption" className="text-muted-foreground">
                ID: {seguimiento.investigacion_id.substring(0, 8)}...
              </Typography>
            </div>
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <FilterLabel>Estado</FilterLabel>
            <div className="p-3 bg-muted/50 rounded-lg border">
              <Chip variant={getChipVariant(seguimiento.estado)} size="sm">
                {seguimiento.estado}
              </Chip>
            </div>
          </div>

          {/* Fecha de Seguimiento */}
          <div className="space-y-2">
            <FilterLabel>Fecha de Seguimiento</FilterLabel>
            <div className="p-3 bg-muted/50 rounded-lg border flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
              <Typography variant="body2">
                {formatearFecha(seguimiento.fecha_seguimiento)}
              </Typography>
            </div>
          </div>

          {/* Responsable */}
          <div className="space-y-2">
            <FilterLabel>Responsable</FilterLabel>
            <div className="p-3 bg-muted/50 rounded-lg border flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-muted-foreground" />
              <Typography variant="body2">
                {seguimiento.responsable_nombre}
              </Typography>
            </div>
          </div>

          {/* Fecha de Creación */}
          <div className="space-y-2">
            <FilterLabel>Fecha de Creación</FilterLabel>
            <div className="p-3 bg-muted/50 rounded-lg border flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
              <Typography variant="body2">
                {formatearFecha(seguimiento.creado_el)}
              </Typography>
            </div>
          </div>

          {/* Email del Participante */}
          {seguimiento.participante_externo?.email && (
            <div className="space-y-2">
              <FilterLabel>Email del Participante</FilterLabel>
              <div className="p-3 bg-muted/50 rounded-lg border">
                <Typography variant="body2">
                  {seguimiento.participante_externo.email}
                </Typography>
              </div>
            </div>
          )}
        </div>

        {/* Notas */}
        {seguimiento.notas && (
          <div className="space-y-2">
            <FilterLabel>Notas</FilterLabel>
            <div className="p-3 bg-muted/50 rounded-lg border">
              <div className="flex items-start gap-2">
                <FileTextIcon className="w-4 h-4 text-muted-foreground mt-0.5" />
                <Typography variant="body2" className="whitespace-pre-wrap">
                  {seguimiento.notas}
                </Typography>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>
      </div>
    </SideModal>
  );
};

export default VerSeguimientoSideModal;
