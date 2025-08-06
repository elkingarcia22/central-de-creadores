// Utilitario para manejo de zonas horarias dinámicas
export interface TimezoneInfo {
  timezone: string;
  offset: number;
  currentDate: Date;
  currentDateString: string;
  country?: string;
  city?: string;
}

/**
 * Obtiene la información de zona horaria del navegador del usuario
 */
export const getUserTimezone = (): TimezoneInfo => {
  const now = new Date();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offset = now.getTimezoneOffset();
  
  // Detectar país y ciudad basándose en la zona horaria
  let country = '';
  let city = '';
  
  if (timezone.includes('America/Bogota') || timezone.includes('America/New_York')) {
    country = 'Colombia';
    city = 'Bogotá';
  } else if (timezone.includes('America/')) {
    country = 'América';
    city = timezone.split('/').pop() || '';
  } else if (timezone.includes('Europe/')) {
    country = 'Europa';
    city = timezone.split('/').pop() || '';
  } else if (timezone.includes('Asia/')) {
    country = 'Asia';
    city = timezone.split('/').pop() || '';
  }
  
  return {
    timezone,
    offset,
    currentDate: now,
    currentDateString: now.toISOString().slice(0, 10),
    country,
    city
  };
};

/**
 * Convierte una fecha UTC a la zona horaria del usuario
 */
export const convertToUserTimezone = (utcDate: string | Date): Date => {
  const date = new Date(utcDate);
  const userTimezone = getUserTimezone();
  
  // Crear fecha en la zona horaria del usuario
  const userDate = new Date(date.toLocaleString("en-US", { timeZone: userTimezone.timezone }));
  return userDate;
};

/**
 * Convierte una fecha de la zona horaria del usuario a UTC
 */
export const convertToUTC = (localDate: string | Date, userTimezone?: string): Date => {
  const date = new Date(localDate);
  const tz = userTimezone || getUserTimezone().timezone;
  
  // Obtener el offset en minutos para la fecha específica
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  
  // Ajustar la fecha para convertir a UTC
  const utcDate = new Date(date.getTime() + offsetMs);
  return utcDate;
};

/**
 * Formatea una fecha para mostrar en la zona horaria del usuario
 */
export const formatDateForUser = (
  date: string | Date,
  userTimezone?: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
): string => {
  const tz = userTimezone || getUserTimezone().timezone;
  const dateObj = new Date(date);
  
  return dateObj.toLocaleString('es-ES', {
    ...options,
    timeZone: tz
  });
};

/**
 * Obtiene la fecha mínima permitida para seleccionar (hoy en la zona horaria del usuario)
 */
export const getMinDate = (userTimezone?: string): string => {
  const tz = userTimezone || getUserTimezone().timezone;
  const now = new Date();
  
  // Obtener fecha actual en la zona horaria del usuario
  const localDate = now.toLocaleDateString('es-ES', { 
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  // Convertir DD/MM/YYYY a YYYY-MM-DD
  const [day, month, year] = localDate.split('/');
  return `${year}-${month}-${day}`;
};

/**
 * Obtiene la fecha y hora actual en la zona horaria del usuario
 */
export const getCurrentDateTime = (userTimezone?: string): { date: string; time: string } => {
  const tz = userTimezone || getUserTimezone().timezone;
  const now = new Date();
  
  const date = now.toLocaleDateString('es-ES', { 
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).split('/').reverse().join('-'); // Convertir DD/MM/YYYY a YYYY-MM-DD
  
  const time = now.toLocaleTimeString('es-ES', { 
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  return { date, time };
};

/**
 * Verifica si una sesión está en progreso basándose en fecha, hora y duración
 */
export const isSessionInProgress = (
  sessionDate: string | Date,
  sessionDuration: number = 60, // duración en minutos, por defecto 1 hora
  userTimezone?: string
): boolean => {
  const now = new Date();
  const sessionStart = new Date(sessionDate);
  
  // Si no se especifica zona horaria, usar la del usuario
  const tz = userTimezone || getUserTimezone().timezone;
  
  // Convertir fechas a la zona horaria del usuario
  const nowInTz = new Date(now.toLocaleString("en-US", { timeZone: tz }));
  const sessionStartInTz = new Date(sessionStart.toLocaleString("en-US", { timeZone: tz }));
  
  // Calcular el final de la sesión
  const sessionEndInTz = new Date(sessionStartInTz.getTime() + (sessionDuration * 60 * 1000));
  
  // Verificar si estamos dentro del rango de la sesión
  return nowInTz >= sessionStartInTz && nowInTz <= sessionEndInTz;
};

/**
 * Determina el estado de un reclutamiento basándose en fecha, hora y duración
 */
export const getRecruitmentStatus = (
  sessionDate: string | Date | null,
  sessionDuration: number = 60,
  userTimezone?: string
): 'Pendiente de agendamiento' | 'Pendiente' | 'En progreso' | 'Finalizado' => {
  if (!sessionDate) {
    return 'Pendiente de agendamiento';
  }
  
  const now = new Date();
  const sessionStart = new Date(sessionDate);
  const tz = userTimezone || getUserTimezone().timezone;
  
  // Obtener fecha y hora actual en la zona horaria del usuario
  const nowInUserTz = new Date(now.toLocaleString("en-US", { timeZone: tz }));
  
  // Obtener fecha y hora de inicio de sesión en la zona horaria del usuario
  const sessionStartInUserTz = new Date(sessionStart.toLocaleString("en-US", { timeZone: tz }));
  
  // Calcular el final de la sesión
  const sessionEndInUserTz = new Date(sessionStartInUserTz.getTime() + (sessionDuration * 60 * 1000));
  
  // Debug: Mostrar información de la sesión
  console.log('🔍 === DEBUG ESTADO RECLUTAMIENTO ===');
  console.log('📅 Fecha sesión original:', sessionDate);
  console.log('⏰ Hora actual (UTC):', now.toISOString());
  console.log('⏰ Hora actual (usuario):', nowInUserTz.toLocaleString('es-ES', { timeZone: tz }));
  console.log('🎯 Inicio sesión (usuario):', sessionStartInUserTz.toLocaleString('es-ES', { timeZone: tz }));
  console.log('🏁 Fin sesión (usuario):', sessionEndInUserTz.toLocaleString('es-ES', { timeZone: tz }));
  console.log('⏱️ Duración:', sessionDuration, 'minutos');
  
  // Lógica de estados
  if (nowInUserTz < sessionStartInUserTz) {
    console.log('📋 Estado: Pendiente');
    return 'Pendiente';
  } else if (nowInUserTz >= sessionStartInUserTz && nowInUserTz <= sessionEndInUserTz) {
    console.log('🔄 Estado: En progreso');
    return 'En progreso';
  } else {
    console.log('✅ Estado: Finalizado');
    return 'Finalizado';
  }
};

/**
 * Debug: Muestra información de zona horaria
 */
export const debugTimezone = (): void => {
  const tzInfo = getUserTimezone();
  const currentDateTime = getCurrentDateTime();
  
  console.log('🌍 === INFORMACIÓN DE ZONA HORARIA ===');
  console.log('📍 Zona horaria:', tzInfo.timezone);
  console.log('🌍 País:', tzInfo.country);
  console.log('🏙️ Ciudad:', tzInfo.city);
  console.log('⏰ Offset (minutos):', tzInfo.offset);
  console.log('📅 Fecha actual:', currentDateTime.date);
  console.log('🕐 Hora actual:', currentDateTime.time);
  console.log('📊 Fecha completa:', tzInfo.currentDate.toLocaleString('es-ES'));
  console.log('=====================================');
}; 

/**
 * Crea una fecha UTC desde fecha y hora local
 * Cuando el usuario selecciona 8:20 PM en Colombia, debe guardarse como 1:20 AM UTC del día siguiente
 */
export const createUTCDateFromLocal = (
  fecha: string, // YYYY-MM-DD
  hora: string,  // HH:MM
  userTimezone?: string
): string => {
  // Crear fecha local (JavaScript la interpreta como hora local)
  const fechaLocal = new Date(`${fecha}T${hora}:00`);
  
  // Convertir a UTC (esto mantiene la hora local)
  return fechaLocal.toISOString();
};

/**
 * Crea una fecha UTC desde fecha y hora local (versión alternativa)
 */
export const createUTCDateFromLocalV2 = (
  fecha: string, // YYYY-MM-DD
  hora: string,  // HH:MM
  userTimezone?: string
): string => {
  const tz = userTimezone || getUserTimezone().timezone;
  
  // Obtener el offset de la zona horaria
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60 * 1000;
  
  // Crear fecha local
  const fechaLocal = new Date(`${fecha}T${hora}:00`);
  
  // Ajustar por el offset para obtener UTC
  const fechaUTC = new Date(fechaLocal.getTime() - offsetMs);
  
  return fechaUTC.toISOString();
}; 