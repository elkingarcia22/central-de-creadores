// ====================================
// PRUEBA DE ESTADO DE SESIÓN
// ====================================

const testEstadoSesion = () => {
  console.log('🎯 === PRUEBA DE ESTADO DE SESIÓN ===');
  
  // Datos del caso específico
  const fechaSesion = '2025-07-23T20:20:00.000Z'; // 8:20 PM UTC
  const duracionMinutos = 60;
  const zonaHoraria = 'America/Bogota';
  
  console.log('📅 Fecha sesión (UTC):', fechaSesion);
  console.log('⏱️ Duración:', duracionMinutos, 'minutos');
  console.log('🌍 Zona horaria:', zonaHoraria);
  
  // Función para calcular estado
  const calcularEstado = (sessionDate, sessionDuration, userTimezone) => {
    if (!sessionDate) {
      return 'Pendiente de agendamiento';
    }
    
    const now = new Date();
    const sessionStart = new Date(sessionDate);
    const tz = userTimezone || 'America/Bogota';
    
    // Obtener fecha y hora actual en la zona horaria del usuario
    const nowInUserTz = new Date(now.toLocaleString("en-US", { timeZone: tz }));
    
    // Obtener fecha y hora de inicio de sesión en la zona horaria del usuario
    const sessionStartInUserTz = new Date(sessionStart.toLocaleString("en-US", { timeZone: tz }));
    
    // Calcular el final de la sesión
    const sessionEndInUserTz = new Date(sessionStartInUserTz.getTime() + (sessionDuration * 60 * 1000));
    
    // Debug: Mostrar información de la sesión
    console.log('\n🔍 === ANÁLISIS DETALLADO ===');
    console.log('📅 Fecha sesión original:', sessionDate);
    console.log('⏰ Hora actual (UTC):', now.toISOString());
    console.log('⏰ Hora actual (Colombia):', nowInUserTz.toLocaleString('es-ES', { timeZone: tz }));
    console.log('🎯 Inicio sesión (Colombia):', sessionStartInUserTz.toLocaleString('es-ES', { timeZone: tz }));
    console.log('🏁 Fin sesión (Colombia):', sessionEndInUserTz.toLocaleString('es-ES', { timeZone: tz }));
    console.log('⏱️ Duración:', sessionDuration, 'minutos');
    
    // Comparaciones
    console.log('\n🔍 === COMPARACIONES ===');
    console.log('¿Ahora < Inicio?', nowInUserTz < sessionStartInUserTz);
    console.log('¿Ahora >= Inicio?', nowInUserTz >= sessionStartInUserTz);
    console.log('¿Ahora <= Fin?', nowInUserTz <= sessionEndInUserTz);
    console.log('¿Dentro del rango?', nowInUserTz >= sessionStartInUserTz && nowInUserTz <= sessionEndInUserTz);
    
    // Lógica de estados
    if (nowInUserTz < sessionStartInUserTz) {
      console.log('\n📋 Estado: Pendiente');
      return 'Pendiente';
    } else if (nowInUserTz >= sessionStartInUserTz && nowInUserTz <= sessionEndInUserTz) {
      console.log('\n🔄 Estado: En progreso');
      return 'En progreso';
    } else {
      console.log('\n✅ Estado: Finalizado');
      return 'Finalizado';
    }
  };
  
  // Ejecutar prueba
  const estado = calcularEstado(fechaSesion, duracionMinutos, zonaHoraria);
  
  // Información adicional
  console.log('\n📊 === INFORMACIÓN ADICIONAL ===');
  const now = new Date();
  const sessionStart = new Date(fechaSesion);
  
  console.log('🕐 Hora actual en Colombia:', now.toLocaleTimeString('es-ES', {
    timeZone: 'America/Bogota',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }));
  
  console.log('🕐 Hora sesión en Colombia:', sessionStart.toLocaleTimeString('es-ES', {
    timeZone: 'America/Bogota',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }));
  
  // Calcular fin de sesión
  const sessionEnd = new Date(sessionStart.getTime() + (duracionMinutos * 60 * 1000));
  console.log('🕐 Hora fin sesión en Colombia:', sessionEnd.toLocaleTimeString('es-ES', {
    timeZone: 'America/Bogota',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }));
  
  console.log('\n🎯 === RESULTADO FINAL ===');
  console.log('Estado calculado:', estado);
  
  return {
    fechaSesion,
    duracionMinutos,
    zonaHoraria,
    estado,
    horaActual: now.toLocaleTimeString('es-ES', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', hour12: false }),
    horaInicio: sessionStart.toLocaleTimeString('es-ES', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', hour12: false }),
    horaFin: sessionEnd.toLocaleTimeString('es-ES', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', hour12: false })
  };
};

// Ejecutar si estamos en el navegador
if (typeof window !== 'undefined') {
  window.testEstadoSesion = testEstadoSesion;
  console.log('🎯 Función disponible. Ejecuta: testEstadoSesion()');
  
  // Ejecutar automáticamente
  const resultado = testEstadoSesion();
  console.log('📊 Resultado completo:', resultado);
}

// Exportar para uso en Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testEstadoSesion };
} 