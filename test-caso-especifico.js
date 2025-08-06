// ====================================
// PRUEBA CASO ESPECÍFICO: 23 JULIO 8:20 PM
// ====================================

const testCasoEspecifico = () => {
  console.log('🎯 === PRUEBA CASO ESPECÍFICO ===');
  
  // Datos del caso específico del usuario
  const fechaSesion = '2025-07-23T20:20:00.000Z'; // 8:20 PM UTC
  const duracionMinutos = 60;
  
  console.log('📅 Fecha sesión (UTC):', fechaSesion);
  console.log('⏱️ Duración:', duracionMinutos, 'minutos');
  
  // Convertir a Colombia (UTC-5)
  const sessionStart = new Date(fechaSesion);
  const sessionEnd = new Date(sessionStart.getTime() + (duracionMinutos * 60 * 1000));
  const now = new Date();
  
  console.log('\n🕐 === HORARIOS EN COLOMBIA ===');
  console.log('🕐 Hora actual Colombia:', now.toLocaleTimeString('es-ES', {
    timeZone: 'America/Bogota',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }));
  
  console.log('🎯 Inicio sesión Colombia:', sessionStart.toLocaleTimeString('es-ES', {
    timeZone: 'America/Bogota',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }));
  
  console.log('🏁 Fin sesión Colombia:', sessionEnd.toLocaleTimeString('es-ES', {
    timeZone: 'America/Bogota',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }));
  
  // Función mejorada para calcular estado
  const calcularEstadoMejorado = (sessionDate, sessionDuration) => {
    const now = new Date();
    const sessionStart = new Date(sessionDate);
    const sessionEnd = new Date(sessionStart.getTime() + (sessionDuration * 60 * 1000));
    
    // Obtener fechas en zona horaria Colombia
    const nowColombia = new Date(now.toLocaleString("en-US", { timeZone: 'America/Bogota' }));
    const startColombia = new Date(sessionStart.toLocaleString("en-US", { timeZone: 'America/Bogota' }));
    const endColombia = new Date(sessionEnd.toLocaleString("en-US", { timeZone: 'America/Bogota' }));
    
    console.log('\n🔍 === ANÁLISIS DETALLADO ===');
    console.log('⏰ Ahora (Colombia):', nowColombia.toLocaleString('es-ES', { timeZone: 'America/Bogota' }));
    console.log('🎯 Inicio (Colombia):', startColombia.toLocaleString('es-ES', { timeZone: 'America/Bogota' }));
    console.log('🏁 Fin (Colombia):', endColombia.toLocaleString('es-ES', { timeZone: 'America/Bogota' }));
    
    console.log('\n🔍 === COMPARACIONES ===');
    console.log('¿Ahora < Inicio?', nowColombia < startColombia);
    console.log('¿Ahora >= Inicio?', nowColombia >= startColombia);
    console.log('¿Ahora <= Fin?', nowColombia <= endColombia);
    console.log('¿Dentro del rango?', nowColombia >= startColombia && nowColombia <= endColombia);
    
    // Lógica de estados
    if (nowColombia < startColombia) {
      return 'Pendiente';
    } else if (nowColombia >= startColombia && nowColombia <= endColombia) {
      return 'En progreso';
    } else {
      return 'Finalizado';
    }
  };
  
  // Ejecutar cálculo
  const estado = calcularEstadoMejorado(fechaSesion, duracionMinutos);
  
  console.log('\n🎯 === RESULTADO ===');
  console.log('Estado calculado:', estado);
  
  // Verificar si debería estar en progreso
  const horaActual = now.toLocaleTimeString('es-ES', { 
    timeZone: 'America/Bogota', 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  });
  
  const horaInicio = sessionStart.toLocaleTimeString('es-ES', { 
    timeZone: 'America/Bogota', 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  });
  
  const horaFin = sessionEnd.toLocaleTimeString('es-ES', { 
    timeZone: 'America/Bogota', 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  });
  
  console.log('\n📊 === RESUMEN ===');
  console.log('🕐 Hora actual:', horaActual);
  console.log('🎯 Hora inicio:', horaInicio);
  console.log('🏁 Hora fin:', horaFin);
  console.log('📋 Estado esperado:', estado);
  
  // Verificar si el usuario está en el rango correcto
  const horaActualNum = parseInt(horaActual.split(':')[0]) * 60 + parseInt(horaActual.split(':')[1]);
  const horaInicioNum = parseInt(horaInicio.split(':')[0]) * 60 + parseInt(horaInicio.split(':')[1]);
  const horaFinNum = parseInt(horaFin.split(':')[0]) * 60 + parseInt(horaFin.split(':')[1]);
  
  console.log('\n🔢 === ANÁLISIS NUMÉRICO ===');
  console.log('Hora actual (minutos):', horaActualNum);
  console.log('Hora inicio (minutos):', horaInicioNum);
  console.log('Hora fin (minutos):', horaFinNum);
  console.log('¿En rango?', horaActualNum >= horaInicioNum && horaActualNum <= horaFinNum);
  
  return {
    fechaSesion,
    duracionMinutos,
    estado,
    horaActual,
    horaInicio,
    horaFin,
    enRango: horaActualNum >= horaInicioNum && horaActualNum <= horaFinNum
  };
};

// Ejecutar si estamos en el navegador
if (typeof window !== 'undefined') {
  window.testCasoEspecifico = testCasoEspecifico;
  console.log('🎯 Función disponible. Ejecuta: testCasoEspecifico()');
  
  // Ejecutar automáticamente
  const resultado = testCasoEspecifico();
  console.log('📊 Resultado completo:', resultado);
}

// Exportar para uso en Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testCasoEspecifico };
} 