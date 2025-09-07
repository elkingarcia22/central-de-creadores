import React from 'react';
import { useRouter } from 'next/router';
import { Sesion } from '../../types/sesiones';

interface SesionCardProps {
  sesion: Sesion;
  onEdit?: (sesion: Sesion) => void;
  onDelete?: (sesion: Sesion) => void;
  onViewMore?: (sesion: Sesion) => void;
  className?: string;
}

const SesionCard: React.FC<SesionCardProps> = ({
  sesion,
  onEdit,
  onDelete,
  onViewMore,
  className = ''
}) => {
  const router = useRouter();

  // Formatear duración
  const formatDuracion = (duracionMinutos: number) => {
    const horas = Math.floor(duracionMinutos / 60);
    const minutos = duracionMinutos % 60;
    
    if (horas > 0) {
      return `${horas}h ${minutos}m`;
    }
    return `${minutos}m`;
  };

  // Formatear fecha
  const formatFecha = (fecha: Date | string | null) => {
    if (!fecha) return 'Sin fecha';
    
    try {
      const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
      
      // Verificar si la fecha es válida
      if (isNaN(fechaObj.getTime())) {
        return 'Fecha inválida';
      }
      
      return new Intl.DateTimeFormat('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(fechaObj);
    } catch (error) {
      console.error('Error formateando fecha:', error, fecha);
      return 'Error en fecha';
    }
  };

  return (
    <div className={`p-6 border rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                {sesion.titulo}
              </h3>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              sesion.estado === 'completada' ? 'bg-green-100 text-green-800' :
              sesion.estado === 'programada' ? 'bg-blue-100 text-blue-800' :
              sesion.estado === 'en_curso' ? 'bg-orange-100 text-orange-800' :
              sesion.estado === 'cancelada' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {sesion.estado}
            </span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-2 ml-4">
          <button
            className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={() => {
              if (onViewMore) {
                onViewMore(sesion);
              } else {
                router.push(`/sesiones/${sesion.id}`);
              }
            }}
          >
            Ver más
          </button>
          
          {onEdit && (
            <button
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              onClick={() => onEdit(sesion)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          
          {onDelete && (
            <button
              className="p-2 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-100"
              onClick={() => onDelete(sesion)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Descripción */}
      {sesion.descripcion && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {sesion.descripcion}
          </p>
        </div>
      )}

      {/* Información de la sesión */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fecha y hora */}
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div>
            <p className="text-xs text-gray-500">Fecha</p>
            <p className="text-sm font-medium">{formatFecha(sesion.fecha_programada)}</p>
          </div>
        </div>

        {/* Duración */}
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-xs text-gray-500">Duración</p>
            <p className="text-sm font-medium">{formatDuracion(sesion.duracion_minutos)}</p>
          </div>
        </div>

        {/* Ubicación */}
        {sesion.ubicacion && (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <p className="text-xs text-gray-500">Ubicación</p>
              <p className="text-sm font-medium">{sesion.ubicacion}</p>
            </div>
          </div>
        )}

        {/* Tipo de sesión */}
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <div>
            <p className="text-xs text-gray-500">Tipo</p>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              sesion.tipo_sesion === 'presencial' ? 'bg-blue-100 text-blue-800' :
              sesion.tipo_sesion === 'virtual' ? 'bg-purple-100 text-purple-800' :
              sesion.tipo_sesion === 'hibrida' ? 'bg-orange-100 text-orange-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {sesion.tipo_sesion}
            </span>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {sesion.grabacion_permitida && (
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Grabación permitida</span>
              </div>
            )}
            {sesion.investigacion_nombre && (
              <div className="flex items-center gap-1">
                <span>Investigación: {sesion.investigacion_nombre}</span>
              </div>
            )}
          </div>
          
          {sesion.created_at && (
            <p className="text-xs text-gray-500">
              Creado: {formatFecha(sesion.created_at)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SesionCard;