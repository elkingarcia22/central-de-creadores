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
  agendador: {
    investigaciones: { permisos: ['ver'], filtroAsignacion: false },
    reclutamientos: { permisos: ['ver', 'editar'], filtroAsignacion: true },
    participantes: { permisos: ['ver'], filtroAsignacion: false },
    empresas: { permisos: ['ver'], filtroAsignacion: false },
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
    // Nuevas funciones para permisos específicos
    tienePermisoSobreElemento: (elemento: any, modulo: ModuloPermiso, permiso: TipoPermiso) => 
      tienePermisoSobreElemento(elemento, modulo, permiso, userProfile?.id || '', esAdministrador(), rolSeleccionado),
    usuarioEsCreador: (elemento: any, modulo: ModuloPermiso) => 
      usuarioEsCreador(elemento, modulo, userProfile?.id || ''),
    elementoPerteneceAUsuario: (elemento: any, modulo: ModuloPermiso) => 
      elementoPerteneceAUsuario(elemento, modulo, userProfile?.id || '', esAdministrador(), rolSeleccionado),
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

export const construirFiltroReclutamientos = (usuarioId: string, esAdmin: boolean, rol?: string) => {
  if (esAdmin) return {};
  
  // Para el rol agendador, solo ver reclutamientos donde es responsable del agendamiento
  if (rol === 'agendador') {
    return {
      responsable_agendamiento: { eq: usuarioId }
    };
  }
  
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
export const obtenerFiltroAsignacion = (modulo: ModuloPermiso, usuarioId: string, esAdmin: boolean, rol?: string) => {
  switch (modulo) {
    case 'investigaciones':
      return construirFiltroInvestigaciones(usuarioId, esAdmin);
    case 'reclutamientos':
      return construirFiltroReclutamientos(usuarioId, esAdmin, rol);
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
  esAdmin: boolean,
  rol?: string
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
      // Para el rol agendador, solo verificar si es responsable del agendamiento
      if (rol === 'agendador') {
        return elemento.responsable_agendamiento?.id === usuarioId;
      }
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

// Función para verificar si el usuario es el creador del elemento
export const usuarioEsCreador = (
  elemento: any, 
  modulo: ModuloPermiso, 
  usuarioId: string
): boolean => {
  switch (modulo) {
    case 'investigaciones':
      return elemento.creado_por === usuarioId;
    
    case 'reclutamientos':
      return elemento.creado_por === usuarioId;
    
    case 'participantes':
      return elemento.creado_por === usuarioId;
    
    case 'empresas':
      return elemento.creado_por === usuarioId;
    
    case 'sesiones':
      return elemento.creado_por === usuarioId;
    
    default:
      return false;
  }
};

// Función para verificar permisos específicos sobre un elemento
export const tienePermisoSobreElemento = (
  elemento: any,
  modulo: ModuloPermiso,
  permiso: TipoPermiso,
  usuarioId: string,
  esAdmin: boolean,
  rol?: string
): boolean => {
  // Administradores tienen todos los permisos
  if (esAdmin) return true;
  
  // Si el usuario es el creador, tiene permisos completos
  if (usuarioEsCreador(elemento, modulo, usuarioId)) {
    return true;
  }
  
  // Para otros casos, verificar según el rol y la asignación
  const elementoPertenece = elementoPerteneceAUsuario(elemento, modulo, usuarioId, esAdmin, rol);
  
  switch (permiso) {
    case 'ver':
      return elementoPertenece;
    
    case 'crear':
      // Permitir crear si tiene acceso al módulo
      return true;
    
    case 'editar':
      // Permitir editar si el elemento le pertenece
      return elementoPertenece;
    
    case 'eliminar':
      // Solo el creador o administrador puede eliminar
      return usuarioEsCreador(elemento, modulo, usuarioId);
    
    default:
      return false;
  }
};
