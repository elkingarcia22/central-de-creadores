// Tipos de estado disponibles
export type EstadoInvestigacion = 'en_borrador' | 'por_agendar' | 'en_progreso' | 'finalizado' | 'pausado' | 'cancelado';
export type EstadoSesion = 'programada' | 'en_curso' | 'completada' | 'cancelada';
export type EstadoParticipante = 'activo' | 'inactivo' | 'pendiente';
export type EstadoEmpresa = 'activa' | 'inactiva' | 'pendiente';
export type EstadoConocimiento = 'publicado' | 'borrador' | 'revision';
export type EstadoMetrica = 'generado' | 'en_proceso' | 'pendiente' | 'error';
export type EstadoReclutamiento = 'pendiente' | 'en_progreso' | 'pausado' | 'cancelado' | 'finalizado';

// Sistema de colores único para cada estado (sin repeticiones)
// default = gris oscuro, info = azul, warning = amarillo, success = verde, secondary = gris claro, danger = rojo, primary = azul oscuro

// Función para obtener el color del badge de estado de investigación
export const getEstadoInvestigacionVariant = (estado: string): 'default' | 'accent-teal' | 'accent-orange' | 'info' | 'success' | 'secondary' | 'danger' => {
  switch (estado?.toLowerCase()) {
    case 'en_borrador': 
    case 'en borrador': return 'accent-teal';  // Verde azulado
    case 'por_agendar': 
    case 'por agendar': return 'accent-orange'; // Naranja
    case 'en_progreso': 
    case 'en progreso': return 'info';         // Azul claro
    case 'finalizado': return 'success';       // Verde
    case 'pausado': return 'secondary';        // Gris claro
    case 'cancelado': return 'danger';         // Rojo
    default: return 'default';
  }
};

// Función para obtener el texto del estado de investigación
export const getEstadoInvestigacionText = (estado: string): string => {
  switch (estado?.toLowerCase()) {
    case 'en_borrador':
    case 'en borrador':
      return 'En Borrador';
    case 'por_agendar':
    case 'por agendar':
      return 'Por Agendar';
    case 'en_progreso':
    case 'en progreso':
      return 'En Progreso';
    case 'finalizado':
      return 'Finalizado';
    case 'pausado':
      return 'Pausado';
    case 'cancelado':
      return 'Cancelado';
    default:
      return 'Sin Estado';
  }
};

// Función para obtener el color del badge de estado de sesión
export const getEstadoSesionVariant = (estado: string): 'default' | 'info' | 'warning' | 'success' | 'danger' => {
  switch (estado?.toLowerCase()) {
    case 'programada': return 'info';          // Azul
    case 'en_curso': 
    case 'en curso': return 'warning';         // Amarillo
    case 'completada': return 'success';       // Verde
    case 'cancelada': return 'danger';         // Rojo
    default: return 'default';                 // Gris oscuro
  }
};

// Función para obtener el texto del estado de sesión
export const getEstadoSesionText = (estado: string): string => {
  switch (estado?.toLowerCase()) {
    case 'programada':
      return 'Programada';
    case 'en_curso':
    case 'en curso':
      return 'En Curso';
    case 'completada':
      return 'Completada';
    case 'cancelada':
      return 'Cancelada';
    default:
      return 'Sin Estado';
  }
};

// Función para obtener el color del badge de estado de participante
export const getEstadoParticipanteVariant = (estado: string): 'terminada' | 'pendiente' | 'transitoria' | 'fallo' | 'secondary' => {
  const estadoLower = estado?.toLowerCase()?.trim()?.replace(/\s+/g, ' ');
  
  switch (estadoLower) {
    case 'activo': return 'terminada';         // Verde (estado exitoso)
    case 'disponible': return 'terminada';     // Verde (estado exitoso)
    case 'en enfriamiento': return 'pendiente'; // Azul (estado pendiente)
    case 'pendiente': return 'pendiente';      // Azul (estado pendiente)
    case 'pendiente de agendamiento': return 'transitoria'; // Amarillo (estado transitorio)
    case 'inactivo': return 'fallo';           // Rojo (estado fallido)
    default: return 'secondary';               // Gris claro
  }
};

// Función para obtener el texto del estado de participante
export const getEstadoParticipanteText = (estado: string): string => {
  const estadoLower = estado?.toLowerCase()?.trim()?.replace(/\s+/g, ' ');
  
  switch (estadoLower) {
    case 'activo':
      return 'Activo';
    case 'inactivo':
      return 'Inactivo';
    case 'pendiente':
      return 'Pendiente';
    case 'pendiente de agendamiento':
      return 'Pendiente de Agendamiento';
    case 'disponible':
      return 'Disponible';
    case 'en enfriamiento':
      return 'En Enfriamiento';
    default:
      return 'Sin Estado';
  }
};

// Función para obtener el color del badge de estado de empresa
export const getEstadoEmpresaVariant = (estado: string): 'success' | 'secondary' | 'warning' => {
  switch (estado?.toLowerCase()) {
    case 'activa': return 'success';           // Verde
    case 'inactiva': return 'secondary';       // Gris claro
    case 'pendiente': return 'warning';        // Amarillo
    default: return 'secondary';               // Gris claro
  }
};

// Función para obtener el texto del estado de empresa
export const getEstadoEmpresaText = (estado: string): string => {
  switch (estado?.toLowerCase()) {
    case 'activa':
      return 'Activa';
    case 'inactiva':
      return 'Inactiva';
    case 'pendiente':
      return 'Pendiente';
    default:
      return 'Sin Estado';
  }
};

// Función para obtener el color del badge de estado de conocimiento
export const getEstadoConocimientoVariant = (estado: string): 'success' | 'default' | 'warning' => {
  switch (estado?.toLowerCase()) {
    case 'publicado': return 'success';        // Verde
    case 'borrador': return 'default';         // Gris oscuro
    case 'revision': 
    case 'revisión': return 'warning';         // Amarillo
    default: return 'default';                 // Gris oscuro
  }
};

// Función para obtener el texto del estado de conocimiento
export const getEstadoConocimientoText = (estado: string): string => {
  switch (estado?.toLowerCase()) {
    case 'publicado':
      return 'Publicado';
    case 'borrador':
      return 'Borrador';
    case 'revision':
    case 'revisión':
      return 'En Revisión';
    default:
      return 'Sin Estado';
  }
};

// Función para obtener el color del badge de estado de métrica
export const getEstadoMetricaVariant = (estado: string): 'success' | 'warning' | 'default' | 'danger' => {
  switch (estado?.toLowerCase()) {
    case 'generado': return 'success';         // Verde
    case 'en_proceso': 
    case 'en proceso': return 'warning';       // Amarillo
    case 'pendiente': return 'default';        // Gris oscuro
    case 'error': return 'danger';             // Rojo
    default: return 'default';                 // Gris oscuro
  }
};

// Función para obtener el texto del estado de métrica
export const getEstadoMetricaText = (estado: string): string => {
  switch (estado?.toLowerCase()) {
    case 'generado':
      return 'Generado';
    case 'en_proceso':
    case 'en proceso':
      return 'En Proceso';
    case 'pendiente':
      return 'Pendiente';
    case 'error':
      return 'Error';
    default:
      return 'Sin Estado';
  }
};

// Función para obtener el color del badge de estado de reclutamiento
export const getEstadoReclutamientoVariant = (estado: string): 'default' | 'warning' | 'accent-purple' | 'success' | 'accent-indigo' | 'accent-pink' | 'danger' | 'secondary' => {
  const estadoLower = estado?.toLowerCase()?.trim()?.replace(/\s+/g, ' ');
  
  switch (estadoLower) {
    case 'pendiente': 
    case 'pendiente de agendamiento': return 'info';           // Azul
    case 'en progreso': 
    case 'en_progreso': 
    case 'en progreso': return 'primary'; // Azul primario (más seguro)
    case 'agendada': return 'success';         // Verde (como finalizado)
    case 'por agendar': 
    case 'por_agendar': return 'accent-indigo'; // Índigo (único)
    case 'pausado': return 'accent-pink';      // Rosa (único)
    case 'cancelado': return 'danger';         // Rojo
    case 'finalizado': return 'success';       // Verde
    default: return 'default';                 // Gris oscuro
  }
};

// Función para obtener el texto del estado de reclutamiento
export const getEstadoReclutamientoText = (estado: string): string => {
  const estadoLower = estado?.toLowerCase()?.trim()?.replace(/\s+/g, ' ');
  
  switch (estadoLower) {
    case 'pendiente':
      return 'Pendiente';
    case 'pendiente de agendamiento':
      return 'Pendiente de Agendamiento';
    case 'en progreso':
    case 'en_progreso':
      return 'En Progreso';
    case 'agendada':
      return 'Agendada';
    case 'por agendar':
    case 'por_agendar':
      return 'Por Agendar';
    case 'pausado':
      return 'Pausado';
    case 'cancelado':
      return 'Cancelado';
    case 'finalizado':
      return 'Finalizado';
    default:
      return 'Sin Estado';
  }
};

// Función genérica para obtener el color del badge de estado (para compatibilidad)
export const getEstadoVariant = (estado: string, tipo: 'investigacion' | 'sesion' | 'participante' | 'empresa' | 'conocimiento' | 'metrica' | 'reclutamiento'): string => {
  switch (tipo) {
    case 'investigacion':
      return getEstadoInvestigacionVariant(estado);
    case 'sesion':
      return getEstadoSesionVariant(estado);
    case 'participante':
      return getEstadoParticipanteVariant(estado);
    case 'empresa':
      return getEstadoEmpresaVariant(estado);
    case 'conocimiento':
      return getEstadoConocimientoVariant(estado);
    case 'metrica':
      return getEstadoMetricaVariant(estado);
    case 'reclutamiento':
      return getEstadoReclutamientoVariant(estado);
    default:
      return 'default';
  }
};

// Función genérica para obtener el texto del estado (para compatibilidad)
export const getEstadoText = (estado: string, tipo: 'investigacion' | 'sesion' | 'participante' | 'empresa' | 'conocimiento' | 'metrica' | 'reclutamiento'): string => {
  switch (tipo) {
    case 'investigacion':
      return getEstadoInvestigacionText(estado);
    case 'sesion':
      return getEstadoSesionText(estado);
    case 'participante':
      return getEstadoParticipanteText(estado);
    case 'empresa':
      return getEstadoEmpresaText(estado);
    case 'conocimiento':
      return getEstadoConocimientoText(estado);
    case 'metrica':
      return getEstadoMetricaText(estado);
    case 'reclutamiento':
      return getEstadoReclutamientoText(estado);
    default:
      return 'Sin Estado';
  }
};

// Función para obtener el color del badge de estado de agendamiento
export const getEstadoAgendamientoBadgeVariant = (estado: string): 'default' | 'warning' | 'info' | 'success' | 'danger' => {
  const estadoLower = estado?.toLowerCase()?.trim()?.replace(/\s+/g, ' ');
  
  switch (estadoLower) {
    case 'pendiente': 
    case 'pendiente de agendamiento': return 'info';           // Azul
    case 'agendada': 
    case 'programada': return 'warning';                       // Amarillo
    case 'confirmada': 
    case 'confirmado': return 'success';                       // Verde
    case 'cancelada': 
    case 'cancelado': return 'danger';                         // Rojo
    default: return 'default';                                 // Gris oscuro
  }
};
