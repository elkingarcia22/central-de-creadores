import React from 'react';
import { Sesion } from '../../types/sesiones';
import { Card } from '../ui';
import { 
  CalendarIcon, 
  ClockIcon, 
  LocationIcon, 
  UserIcon,
  EditIcon,
  TrashIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  PlayIcon
} from '../icons';

interface SesionesListaProps {
  sesiones: Sesion[];
  loading: boolean;
  onSesionClick: (sesion: Sesion) => void;
  onSesionEdit: (sesion: Sesion) => void;
  onSesionDelete: (sesion: Sesion) => void;
}

const SesionesLista: React.FC<SesionesListaProps> = ({
  sesiones,
  loading,
  onSesionClick,
  onSesionEdit,
  onSesionDelete
}) => {
  console.log('SesionesLista recibió:', { sesiones, loading });
  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'completada':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'programada':
        return <PlayIcon className="w-4 h-4 text-blue-500" />;
      case 'cancelada':
        return <AlertCircleIcon className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircleIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completada':
        return 'bg-green-100 text-green-800';
      case 'programada':
        return 'bg-blue-100 text-blue-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFecha = (fecha: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(fecha);
  };

  const formatDuracion = (duracionMinutos: number) => {
    const horas = Math.floor(duracionMinutos / 60);
    const minutos = duracionMinutos % 60;
    
    if (horas > 0) {
      return `${horas}h ${minutos}m`;
    }
    return `${minutos}m`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="flex items-center gap-4">
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (sesiones.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No hay sesiones</h3>
        <p className="text-muted-foreground mb-4">
          Aún no se han programado sesiones de investigación
        </p>
        <button className="text-primary hover:underline">
          Crear primera sesión
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sesiones.map((sesion) => (
        <Card 
          key={sesion.id} 
          className="p-6 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onSesionClick(sesion)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {sesion.titulo}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(sesion.estado)}`}>
                  {getEstadoIcon(sesion.estado)}
                  <span className="ml-1 capitalize">{sesion.estado}</span>
                </span>
              </div>
              
              {sesion.descripcion && (
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {sesion.descripcion}
                </p>
              )}

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{formatFecha(sesion.fecha_programada)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4" />
                  <span>{formatDuracion(sesion.duracion_minutos)}</span>
                </div>
                
                {sesion.ubicacion && (
                  <div className="flex items-center gap-2">
                    <LocationIcon className="w-4 h-4" />
                    <span>{sesion.ubicacion}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  <span className="capitalize">{sesion.tipo_sesion}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSesionEdit(sesion);
                }}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                title="Editar sesión"
              >
                <EditIcon className="w-4 h-4" />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSesionDelete(sesion);
                }}
                className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                title="Eliminar sesión"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default SesionesLista;
