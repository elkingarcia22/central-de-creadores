import React from 'react';
import SideModal from '../ui/SideModal';
import Typography from '../ui/Typography';
import Badge from '../ui/Badge';
import { BuildingIcon, UserIcon, MapPinIcon, CalendarIcon } from '../icons';
import { formatearFecha } from '../../utils/fechas';

interface Empresa {
  id: string;
  nombre: string;
  descripcion?: string;
  kam_id?: string;
  kam_nombre?: string;
  kam_email?: string;
  pais_id?: string;
  pais_nombre?: string;
  industria_id?: string;
  industria_nombre?: string;
  estado_id?: string;
  estado_nombre?: string;
  tamano_id?: string;
  tamano_nombre?: string;
  modalidad_id?: string;
  modalidad_nombre?: string;
  relacion_id?: string;
  relacion_nombre?: string;
  producto_id?: string;
  producto_nombre?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

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
      title="Detalles de la Empresa"
      size="lg"
    >
      <div className="space-y-6">
        {/* Header con información básica */}
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
            <Typography variant="h4" weight="semibold" className="mb-2">
              Descripción
            </Typography>
            <Typography variant="body1" color="secondary">
              {empresa.descripcion}
            </Typography>
          </div>
        )}

        {/* Información de contacto */}
        <div>
          <Typography variant="h4" weight="semibold" className="mb-4">
            Información de Contacto
          </Typography>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <UserIcon className="w-5 h-5 text-gray-400" />
              <div>
                <Typography variant="body2" color="secondary">
                  KAM Asignado
                </Typography>
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
        <div>
          <Typography variant="h4" weight="semibold" className="mb-4">
            Ubicación y Clasificación
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPinIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <Typography variant="body2" color="secondary">
                    País
                  </Typography>
                  <Typography variant="body1" weight="medium">
                    {empresa.pais_nombre || 'Sin especificar'}
                  </Typography>
                </div>
              </div>

              <div>
                <Typography variant="body2" color="secondary">
                  Industria
                </Typography>
                <Typography variant="body1" weight="medium">
                  {empresa.industria_nombre || 'Sin especificar'}
                </Typography>
              </div>

              <div>
                <Typography variant="body2" color="secondary">
                  Tamaño
                </Typography>
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

            <div className="space-y-3">
              <div>
                <Typography variant="body2" color="secondary">
                  Modalidad
                </Typography>
                <Typography variant="body1" weight="medium">
                  {empresa.modalidad_nombre || 'Sin especificar'}
                </Typography>
              </div>

              <div>
                <Typography variant="body2" color="secondary">
                  Relación
                </Typography>
                <Typography variant="body1" weight="medium">
                  {empresa.relacion_nombre || 'Sin especificar'}
                </Typography>
              </div>

              <div>
                <Typography variant="body2" color="secondary">
                  Producto
                </Typography>
                <Typography variant="body1" weight="medium">
                  {empresa.producto_nombre || 'Sin especificar'}
                </Typography>
              </div>
            </div>
          </div>
        </div>

        {/* Información de registro */}
        <div>
          <Typography variant="h4" weight="semibold" className="mb-4">
            Información de Registro
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <div>
                <Typography variant="body2" color="secondary">
                  Fecha de Creación
                </Typography>
                <Typography variant="body1" weight="medium">
                  {formatearFecha(empresa.created_at)}
                </Typography>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <div>
                <Typography variant="body2" color="secondary">
                  Última Actualización
                </Typography>
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
