// ====================================
// UTILIDADES DE PERMISOS Y ASIGNACIONES
// ====================================

import { useUser } from '../contexts/UserContext';
import { useRol } from '../contexts/RolContext';

// Tipos para permisos
export type TipoPermiso = 'ver' | 'crear' | 'editar' | 'eliminar';
export type ModuloPermiso = 'investigaciones' | 'reclutamientos' | 'participantes' | 'empresas' | 'sesiones' | 'metricas' | 'conocimiento';

// Interfaz para configuración de permisos por rol
interface ConfiguracionPermisos {
  [rol: string]: {
    [modulo: string]: {
      permisos: TipoPermiso[];
      filtroAsignacion?: boolean; // Si debe filtrar por asignaciones
    };
  };
}

// Configuración de permisos por rol
const CONFIGURACION_PERMISOS: ConfiguracionPermisos = {
  administrador: {
    investigaciones: { permisos: ['ver', 'crear', 'editar', 'eliminar'], filtroAsignacion: false },
    reclutamientos: { permisos: ['ver', 'crear', 'editar', 'eliminar'], filtroAsignacion: false },
    participantes: { permisos: ['ver', 'crear', 'editar', 'eliminar'], filtroAsignacion: false },
    empresas: { permisos: ['ver', 'crear', 'editar', 'eliminar'], filtroAsignacion: false },
    sesiones: { permisos: ['ver', 'crear', 'editar', 'eliminar'], filtroAsignacion: false },
    metricas: { permisos: ['ver'], filtroAsignacion: false },
    conocimiento: { permisos: ['ver', 'crear', 'editar', 'eliminar'], filtroAsignacion: false },
  },
  investigador: {
    investigaciones: { permisos: ['ver', 'crear', 'editar'], filtroAsignacion: true },
    reclutamientos: { permisos: ['ver', 'crear', 'editar'], filtroAsignacion: true },
    participantes: { permisos: ['ver'], filtroAsignacion: false },
    empresas: { permisos: ['ver'], filtroAsignacion: false },
    sesiones: { permisos: ['ver', 'crear', 'editar'], filtroAsignacion: true },
    metricas: { permisos: ['ver'], filtroAsignacion: true },
    conocimiento: { permisos: ['ver', 'crear', 'editar'], filtroAsignacion: false },
  },
  reclutador: {
    investigaciones: { permisos: ['ver'], filtroAsignacion: false },
    reclutamientos: { permisos: ['ver', 'crear', 'editar'], filtroAsignacion: true },
    participantes: { permisos: ['ver', 'crear', 'editar'], filtroAsignacion: true },
    empresas: { permisos: ['ver', 'crear', 'editar'], filtroAsignacion: true },
    sesiones: { permisos: ['ver'], filtroAsignacion: false },
    metricas: { permisos: ['ver'], filtroAsignacion: true },
    conocimiento: { permisos: ['ver'], filtroAsignacion: false },
  },
};

// Hook para verificar permisos
export const usePermisos = () => {
  const { userProfile } = useUser();
  const { rolSeleccionado } = useRol();

  const tienePermiso = (modulo: ModuloPermiso, permiso: TipoPermiso): boolean => {
    if (!userProfile || !rolSeleccionado) return false;
    
    const configRol = CONFIGURACION_PERMISOS[rolSeleccionado.toLowerCase()];
    if (!configRol) return false;
    
    const configModulo = configRol[modulo];
    if (!configModulo) return false;
    
    return configModulo.permisos.includes(permiso);
  };

  const debeFiltrarPorAsignacion = (modulo: ModuloPermiso): boolean => {
    if (!userProfile || !rolSeleccionado) return false;
    
    const configRol = CONFIGURACION_PERMISOS[rolSeleccionado.toLowerCase()];
    if (!configRol) return false;
    
    const configModulo = configRol[modulo];
    if (!configModulo) return false;
    
    return configModulo.filtroAsignacion || false;
  };

  const esAdministrador = (): boolean => {
    return rolSeleccionado?.toLowerCase() === 'administrador';
  };

  return {
    tienePermiso,
    debeFiltrarPorAsignacion,
    esAdministrador,
    usuarioId: userProfile?.id,
    rol: rolSeleccionado,
  };
};

// Funciones para construir filtros de asignación
export const construirFiltroInvestigaciones = (usuarioId: string, esAdmin: boolean) => {
  if (esAdmin) return {};
  
  return {
    or: [
      { responsable_id: { eq: usuarioId } },
      { implementador_id: { eq: usuarioId } },
      { creado_por: { eq: usuarioId } }
    ]
  };
};

export const construirFiltroReclutamientos = (usuarioId: string, esAdmin: boolean) => {
  if (esAdmin) return {};
  
  return {
    or: [
      { responsable_id: { eq: usuarioId } },
      { responsable_agendamiento: { eq: usuarioId } }
    ]
  };
};

export const construirFiltroParticipantes = (usuarioId: string, esAdmin: boolean) => {
  if (esAdmin) return {};
  
  return {
    or: [
      { kam_id: { eq: usuarioId } },
      { empresa_id: { in: `(SELECT empresa_id FROM empresas WHERE kam_id = '${usuarioId}')` } }
    ]
  };
};

export const construirFiltroEmpresas = (usuarioId: string, esAdmin: boolean) => {
  if (esAdmin) return {};
  
  return {
    or: [
      { kam_id: { eq: usuarioId } },
      { contacto: { eq: usuarioId } }
    ]
  };
};

export const construirFiltroSesiones = (usuarioId: string, esAdmin: boolean) => {
  if (esAdmin) return {};
  
  return {
    or: [
      { moderador_id: { eq: usuarioId } },
      { investigacion_id: { in: `(SELECT id FROM investigaciones WHERE responsable_id = '${usuarioId}' OR implementador_id = '${usuarioId}')` } }
    ]
  };
};

// Función para obtener el filtro apropiado según el módulo
export const obtenerFiltroAsignacion = (modulo: ModuloPermiso, usuarioId: string, esAdmin: boolean) => {
  switch (modulo) {
    case 'investigaciones':
      return construirFiltroInvestigaciones(usuarioId, esAdmin);
    case 'reclutamientos':
      return construirFiltroReclutamientos(usuarioId, esAdmin);
    case 'participantes':
      return construirFiltroParticipantes(usuarioId, esAdmin);
    case 'empresas':
      return construirFiltroEmpresas(usuarioId, esAdmin);
    case 'sesiones':
      return construirFiltroSesiones(usuarioId, esAdmin);
    default:
      return {};
  }
};

// Función para verificar si un elemento pertenece al usuario
export const elementoPerteneceAUsuario = (
  elemento: any, 
  modulo: ModuloPermiso, 
  usuarioId: string, 
  esAdmin: boolean
): boolean => {
  if (esAdmin) return true;
  
  switch (modulo) {
    case 'investigaciones':
      return (
        elemento.responsable_id === usuarioId ||
        elemento.implementador_id === usuarioId ||
        elemento.creado_por === usuarioId
      );
    
    case 'reclutamientos':
      return (
        elemento.responsable_id === usuarioId ||
        elemento.responsable_agendamiento?.id === usuarioId
      );
    
    case 'participantes':
      return (
        elemento.kam_id === usuarioId ||
        elemento.empresa_id === usuarioId
      );
    
    case 'empresas':
      return (
        elemento.kam_id === usuarioId ||
        elemento.contacto === usuarioId
      );
    
    case 'sesiones':
      return (
        elemento.moderador_id === usuarioId ||
        elemento.investigacion_id === usuarioId
      );
    
    default:
      return false;
  }
};
