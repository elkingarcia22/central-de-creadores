// ====================================
// PRUEBA DE ESTADO EN NODE.JS
// ====================================

const testEstadoNode = () => {
  console.log('🎯 === PRUEBA DE ESTADO EN NODE.JS ===');
  
  // Datos del caso específico
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
  
  // Función para calcular estado
  const calcularEstado = (sessionDate, sessionDuration) => {
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
  const estado = calcularEstado(fechaSesion, duracionMinutos);
  
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
  
  return {
    fechaSesion,
    duracionMinutos,
    estado,
    horaActual,
    horaInicio,
    horaFin
  };
};

// Ejecutar la prueba
const resultado = testEstadoNode();
console.log('📊 Resultado completo:', resultado);

module.exports = { testEstadoNode }; 