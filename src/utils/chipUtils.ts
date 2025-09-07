// Utilidades para el manejo de chips con agrupaciones de colores
// Basado en las especificaciones del usuario para reducir la cantidad de colores

// Estados pendientes (azul)
export const ESTADOS_PENDIENTES = [
  'pendiente',
  'programada',
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
  'en_curso',
  'pendiente de agendamiento',
  'pausado',
  'medio',
  'regular',
  'edicion'
];

// Estados terminados (verde)
export const ESTADOS_TERMINADOS = [
  'agendada',
  'finalizado',
  'completado',
  'completada',
  'convertido',
  'bajo',
  'activo',
  'activa',
  'disponible',
  'buena',
  'excelente',
  'creación'
];

// Estados de fallo (rojo)
export const ESTADOS_FALLO = [
  'cancelado',
  'cancelada',
  'alto',
  'critico',
  'inactivo',
  'inactiva',
  'no disponible',
  'mal',
  'mala',
  'muy mala'
];

// Tipos de participante (mantener colores únicos)
export const TIPOS_PARTICIPANTE = [
  'externo',
  'interno',
  'friend_family',
  'friend and family'
];

// Tipos de actividad (nuevas agrupaciones)
export const TIPOS_ACTIVIDAD = [
  'creacion',
  'edicion',
  'cambio_estado',
  'cambio_fechas',
  'cambio_responsable',
  'cambio_implementador',
  'cambio_producto',
  'cambio_tipo_investigacion',
  'cambio_periodo',
  'cambio_link_prueba',
  'cambio_link_resultados',
  'cambio_libreto',
  'cambio_descripcion',
  'eliminacion'
];

// Estados de dolor (nuevas agrupaciones)
export const ESTADOS_DOLOR = [
  'sin resolver',
  'sin_resolver',
  'resuelto',
  'archivado'
];

// Niveles de severidad (nuevas agrupaciones)
export const SEVERIDADES = [
  'baja',
  'media',
  'alta',
  'critica'
];

// Función para obtener la variante de chip basada en el valor
export const getChipVariant = (value: string): string => {
  const valueLower = value?.toLowerCase()?.trim();
  
  // Debug detallado para ver qué está pasando
  console.log('🔍 getChipVariant llamado con:', {
    valorOriginal: value,
    valorLowercase: valueLower,
    tipo: typeof value
  });
  
  // Mapeo específico para estados de agendamiento
  if (valueLower === 'finalizado') {
    console.log('✅ Mapeo: finalizado -> terminada (verde)');
    return 'terminada'; // Verde
  }
  if (valueLower === 'cancelado') {
    console.log('✅ Mapeo: cancelado -> fallo (rojo)');
    return 'fallo'; // Rojo
  }
  if (valueLower === 'pendiente de agendamiento') {
    console.log('✅ Mapeo: pendiente de agendamiento -> transitoria (amarillo)');
    return 'transitoria'; // Amarillo (como estaba originalmente)
  }
  if (valueLower === 'pendiente') {
    console.log('✅ Mapeo: pendiente -> pendiente (azul)');
    return 'pendiente'; // Azul
  }
  if (valueLower === 'en progreso') {
    console.log('✅ Mapeo: en progreso -> transitoria (amarillo)');
    return 'transitoria'; // Amarillo
  }
  if (valueLower === 'en_progreso') {
    console.log('✅ Mapeo: en_progreso -> transitoria (amarillo)');
    return 'transitoria'; // Amarillo
  }
  
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
  
  // Tipos de actividad (nuevas agrupaciones)
  if (TIPOS_ACTIVIDAD.includes(valueLower)) {
    switch (valueLower) {
      case 'creacion':
        return 'terminada'; // Verde
      case 'edicion':
        return 'transitoria'; // Amarillo
      case 'eliminacion':
        return 'fallo'; // Rojo
      case 'cambio_estado':
        return 'transitoria'; // Amarillo
      case 'cambio_responsable':
      case 'cambio_implementador':
        return 'transitoria'; // Amarillo
      default:
        return 'pendiente'; // Azul para otros cambios
    }
  }
  
  // Relaciones específicas (verificar después de otros tipos)
  if (valueLower === 'excelente' || valueLower === 'buena') {
    return 'terminada'; // Verde
  }
  if (valueLower === 'regular') {
    return 'transitoria'; // Amarillo
  }
  if (valueLower === 'mala' || valueLower === 'muy mala') {
    return 'fallo'; // Rojo
  }
  
  // Por defecto
  console.log('⚠️ No se encontró mapeo específico, retornando default para:', valueLower);
  return 'default';
};

// Función específica para obtener la variante de chip de estado de dolor
export const getEstadoDolorVariant = (estado: string): 'sin_resolver' | 'resuelto' | 'archivado' => {
  const estadoLower = estado?.toLowerCase()?.trim();
  
  switch (estadoLower) {
    case 'sin resolver':
    case 'sin_resolver':
    case 'activo':
      return 'sin_resolver'; // Rojo
    case 'resuelto':
      return 'resuelto'; // Verde
    case 'archivado':
      return 'archivado'; // Azul
    default:
      return 'sin_resolver'; // Por defecto rojo
  }
};

// Función específica para obtener la variante de chip de severidad
export const getSeveridadVariant = (severidad: string): 'baja' | 'media' | 'alta' | 'critica' => {
  const severidadLower = severidad?.toLowerCase()?.trim();
  
  switch (severidadLower) {
    case 'baja':
      return 'baja'; // Verde
    case 'media':
      return 'media'; // Amarillo
    case 'alta':
      return 'alta'; // Rojo
    case 'critica':
      return 'critica'; // Rojo oscuro
    default:
      return 'media'; // Por defecto amarillo
  }
};

// Función específica para obtener el texto de estado de dolor
export const getEstadoDolorText = (estado: string): string => {
  const estadoLower = estado?.toLowerCase()?.trim();
  
  switch (estadoLower) {
    case 'sin resolver':
    case 'sin_resolver':
    case 'activo':
      return 'Sin Resolver';
    case 'resuelto':
      return 'Resuelto';
    case 'archivado':
      return 'Archivado';
    default:
      return 'Sin Resolver';
  }
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
    case 'regular':
      return 'Regular';
    case 'edicion':
      return 'Edición';
    
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
    case 'activa':
      return 'Activa';
    case 'disponible':
      return 'Disponible';
    case 'buena':
      return 'Buena';
    case 'excelente':
      return 'Excelente';
    case 'creación':
      return 'Creación';
    
    // Estados de fallo
    case 'cancelado':
    case 'cancelada':
      return 'Cancelado';
    case 'alto':
      return 'Alto';
    case 'critico':
      return 'Crítico';
    case 'inactivo':
    case 'inactiva':
      return 'Inactiva';
    case 'no disponible':
      return 'No Disponible';
    case 'mal':
    case 'mala':
      return 'Mala';
    case 'muy mala':
      return 'Muy Mala';
    
    // Tipos de participante
    case 'externo':
      return 'Externo';
    case 'interno':
      return 'Interno';
    case 'friend_family':
    case 'friend and family':
      return 'Friend & Family';
    
    // Tipos de actividad
    case 'creacion':
      return 'Creación';
    case 'edicion':
      return 'Edición';
    case 'eliminacion':
      return 'Eliminación';
    case 'cambio_estado':
      return 'Cambio de Estado';
    case 'cambio_fechas':
      return 'Cambio de Fechas';
    case 'cambio_responsable':
      return 'Cambio de Responsable';
    case 'cambio_implementador':
      return 'Cambio de Implementador';
    case 'cambio_producto':
      return 'Cambio de Producto';
    case 'cambio_tipo_investigacion':
      return 'Cambio de Tipo';
    case 'cambio_periodo':
      return 'Cambio de Período';
    case 'cambio_link_prueba':
      return 'Cambio de Link Prueba';
    case 'cambio_link_resultados':
      return 'Cambio de Link Resultados';
    case 'cambio_libreto':
      return 'Cambio de Libreto';
    case 'cambio_descripcion':
      return 'Cambio de Descripción';
    
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
