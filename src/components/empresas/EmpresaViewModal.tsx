import React from 'react';
import SideModal from '../ui/SideModal';
import Typography from '../ui/Typography';
import Badge from '../ui/Badge';
import { BuildingIcon, UserIcon, MapPinIcon, CalendarIcon } from '../icons';
import { formatearFecha } from '../../utils/fechas';
import { Empresa } from '../../types/empresas';
import { PageHeader, FilterLabel } from '../ui/';



interface EmpresaViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  empresa: Empresa | null;
}

export default function EmpresaViewModal({
  isOpen,
  onClose,
  empresa
}: EmpresaViewModalProps) {
  if (!empresa) return null;

  const getEstadoColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'activa':
        return 'success';
      case 'inactiva':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getTamanoColor = (tamano: string) => {
    switch (tamano?.toLowerCase()) {
      case 'smb':
      case 'pequeña':
        return 'success';
      case 'mid market':
      case 'mediana':
        return 'warning';
      case 'enterprise':
      case 'grande':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      showCloseButton={false}
    >
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Detalles de la Empresa"
          variant="title-only"
          color="gray"
          className="mb-0 -mx-6 -mt-6"
          onClose={onClose}
        />

        {/* Información básica */}
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <BuildingIcon className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <Typography variant="h3" weight="bold" className="mb-2">
              {empresa.nombre}
            </Typography>
            <div className="flex items-center space-x-4">
              <Badge variant={empresa.activo ? 'success' : 'warning'}>
                {empresa.activo ? 'Activa' : 'Inactiva'}
              </Badge>
              {empresa.estado_nombre && (
                <Badge variant={getEstadoColor(empresa.estado_nombre)}>
                  {empresa.estado_nombre}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Descripción */}
        {empresa.descripcion && (
          <div>
            <FilterLabel>Descripción</FilterLabel>
            <Typography variant="body1" color="secondary">
              {empresa.descripcion}
            </Typography>
          </div>
        )}

        {/* Información de contacto */}
        <div className="space-y-4">
          <div>
            <FilterLabel>KAM Asignado</FilterLabel>
            <div className="flex items-center space-x-3">
              <UserIcon className="w-5 h-5 text-gray-400" />
              <div>
                <Typography variant="body1" weight="medium">
                  {empresa.kam_nombre || 'Sin asignar'}
                </Typography>
                {empresa.kam_email && (
                  <Typography variant="body2" color="secondary">
                    {empresa.kam_email}
                  </Typography>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Ubicación y clasificación */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <FilterLabel>País</FilterLabel>
                <div className="flex items-center space-x-3">
                  <MapPinIcon className="w-5 h-5 text-gray-400" />
                  <Typography variant="body1" weight="medium">
                    {empresa.pais_nombre || 'Sin especificar'}
                  </Typography>
                </div>
              </div>

              <div>
                <FilterLabel>Industria</FilterLabel>
                <Typography variant="body1" weight="medium">
                  {empresa.industria_nombre || 'Sin especificar'}
                </Typography>
              </div>

              <div>
                <FilterLabel>Tamaño</FilterLabel>
                {empresa.tamano_nombre ? (
                  <Badge variant={getTamanoColor(empresa.tamano_nombre)}>
                    {empresa.tamano_nombre}
                  </Badge>
                ) : (
                  <Typography variant="body1" weight="medium">
                    Sin especificar
                  </Typography>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <FilterLabel>Modalidad</FilterLabel>
                <Typography variant="body1" weight="medium">
                  {empresa.modalidad_nombre || 'Sin especificar'}
                </Typography>
              </div>

              <div>
                <FilterLabel>Relación</FilterLabel>
                <Typography variant="body1" weight="medium">
                  {empresa.relacion_nombre || 'Sin especificar'}
                </Typography>
              </div>

              <div>
                <FilterLabel>Producto</FilterLabel>
                <Typography variant="body1" weight="medium">
                  {empresa.producto_nombre || 'Sin especificar'}
                </Typography>
              </div>
            </div>
          </div>
        </div>

        {/* Información de registro */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FilterLabel>Fecha de Creación</FilterLabel>
              <div className="flex items-center space-x-3">
                <CalendarIcon className="w-5 h-5 text-gray-400" />
                <Typography variant="body1" weight="medium">
                  {formatearFecha(empresa.created_at)}
                </Typography>
              </div>
            </div>

            <div>
              <FilterLabel>Última Actualización</FilterLabel>
              <div className="flex items-center space-x-3">
                <CalendarIcon className="w-5 h-5 text-gray-400" />
                <Typography variant="body1" weight="medium">
                  {formatearFecha(empresa.updated_at)}
                </Typography>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de cerrar */}
        <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </SideModal>
  );
}
