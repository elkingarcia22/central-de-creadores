// Utilidades para el manejo de chips con agrupaciones de colores
// Basado en las especificaciones del usuario para reducir la cantidad de colores

// Estados pendientes (azul)
export const ESTADOS_PENDIENTES = [
  'pendiente',
  'por agendar',
  'por_agendar',
  'en borrador',
  'en_borrador',
  'en enfriamiento'
];

// Estados transitorios (amarillo más fuerte)
export const ESTADOS_TRANSITORIOS = [
  'en progreso',
  'en_progreso',
  'pendiente de agendamiento',
  'pausado',
  'medio'
];

// Estados terminados (verde)
export const ESTADOS_TERMINADOS = [
  'agendada',
  'finalizado',
  'completado',
  'convertido',
  'bajo',
  'activo',
  'disponible'
];

// Estados de fallo (rojo)
export const ESTADOS_FALLO = [
  'cancelado',
  'cancelada',
  'alto',
  'critico',
  'inactivo',
  'no disponible'
];

// Tipos de participante (mantener colores únicos)
export const TIPOS_PARTICIPANTE = [
  'externo',
  'interno',
  'friend_family',
  'friend and family'
];

// Función para obtener la variante de chip basada en el valor
export const getChipVariant = (value: string): string => {
  const valueLower = value?.toLowerCase()?.trim();
  
  // Estados pendientes (azul)
  if (ESTADOS_PENDIENTES.includes(valueLower)) {
    return 'pendiente';
  }
  
  // Estados transitorios (amarillo más fuerte)
  if (ESTADOS_TRANSITORIOS.includes(valueLower)) {
    return 'transitoria';
  }
  
  // Estados terminados (verde)
  if (ESTADOS_TERMINADOS.includes(valueLower)) {
    return 'terminada';
  }
  
  // Estados de fallo (rojo)
  if (ESTADOS_FALLO.includes(valueLower)) {
    return 'fallo';
  }
  
  // Tipos de participante (mantener colores únicos)
  if (TIPOS_PARTICIPANTE.includes(valueLower)) {
    switch (valueLower) {
      case 'externo':
        return 'accent-cyan';
      case 'interno':
        return 'accent-blue';
      case 'friend_family':
      case 'friend and family':
        return 'accent-violet';
      default:
        return 'accent-cyan';
    }
  }
  
  // Por defecto
  return 'default';
};

// Función para obtener el texto formateado del chip
export const getChipText = (value: string): string => {
  const valueLower = value?.toLowerCase()?.trim();
  
  switch (valueLower) {
    // Estados transitorios
    case 'pendiente':
      return 'Pendiente';
    case 'pendiente de agendamiento':
      return 'Pendiente de Agendamiento';
    case 'por agendar':
    case 'por_agendar':
      return 'Por Agendar';
    case 'en progreso':
    case 'en_progreso':
      return 'En Progreso';
    case 'pausado':
      return 'Pausado';
    case 'en borrador':
    case 'en_borrador':
      return 'En Borrador';
    case 'medio':
      return 'Medio';
    case 'en enfriamiento':
      return 'En Enfriamiento';
    
    // Estados terminados
    case 'agendada':
      return 'Agendada';
    case 'finalizado':
      return 'Finalizado';
    case 'completado':
      return 'Completado';
    case 'convertido':
      return 'Convertido';
    case 'bajo':
      return 'Bajo';
    case 'activo':
      return 'Activo';
    case 'disponible':
      return 'Disponible';
    
    // Estados de fallo
    case 'cancelado':
    case 'cancelada':
      return 'Cancelado';
    case 'alto':
      return 'Alto';
    case 'critico':
      return 'Crítico';
    case 'inactivo':
      return 'Inactivo';
    case 'no disponible':
      return 'No Disponible';
    
    // Tipos de participante
    case 'externo':
      return 'Externo';
    case 'interno':
      return 'Interno';
    case 'friend_family':
    case 'friend and family':
      return 'Friend & Family';
    
    default:
      return value || 'Sin Estado';
  }
};

// Función para verificar si un valor pertenece a una categoría específica
export const isEstadoPendiente = (value: string): boolean => {
  return ESTADOS_PENDIENTES.includes(value?.toLowerCase()?.trim());
};

export const isEstadoTransitorio = (value: string): boolean => {
  return ESTADOS_TRANSITORIOS.includes(value?.toLowerCase()?.trim());
};

export const isEstadoTerminado = (value: string): boolean => {
  return ESTADOS_TERMINADOS.includes(value?.toLowerCase()?.trim());
};

export const isEstadoFallo = (value: string): boolean => {
  return ESTADOS_FALLO.includes(value?.toLowerCase()?.trim());
};

export const isTipoParticipante = (value: string): boolean => {
  return TIPOS_PARTICIPANTE.includes(value?.toLowerCase()?.trim());
};
