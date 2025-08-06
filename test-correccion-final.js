// ====================================
// TEST CORRECCIÓN FINAL
// ====================================

// Función corregida
const createUTCDateFromLocal = (fecha, hora) => {
  const fechaLocal = new Date(`${fecha}T${hora}:00`);
  const offsetMs = fechaLocal.getTimezoneOffset() * 60 * 1000;
  const fechaUTC = new Date(fechaLocal.getTime() - offsetMs);
  return fechaUTC.toISOString();
};

const testCorreccionFinal = () => {
  console.log('🎯 === TEST CORRECCIÓN FINAL ===');
  
  // Caso del usuario
  const fechaSesion = '2025-07-23';
  const horaSesion = '20:20';
  
  console.log('📅 Fecha seleccionada:', fechaSesion);
  console.log('🕐 Hora seleccionada:', horaSesion);
  
  // Método anterior (problemático)
  const fechaAnterior = new Date(`${fechaSesion}T${horaSesion}`).toISOString();
  
  // Método nuevo (corregido)
  const fechaNueva = createUTCDateFromLocal(fechaSesion, horaSesion);
  
  console.log('\n📊 === COMPARACIÓN ===');
  console.log('❌ Método anterior:', fechaAnterior);
  console.log('✅ Método nuevo:', fechaNueva);
  
  // Verificar en Colombia
  const fechaAnteriorColombia = new Date(fechaAnterior).toLocaleString('es-ES', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  const fechaNuevaColombia = new Date(fechaNueva).toLocaleString('es-ES', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  console.log('\n🇨🇴 === EN COLOMBIA ===');
  console.log('❌ Método anterior:', fechaAnteriorColombia);
  console.log('✅ Método nuevo:', fechaNuevaColombia);
  console.log('🎯 Esperado:', '23/07/2025, 20:20');
  
  // Verificar si es correcto
  const esCorrecto = fechaNuevaColombia.includes('20:20');
  console.log('\n✅ ¿Es correcto?', esCorrecto ? 'SÍ' : 'NO');
  
  // Probar con la hora actual
  const ahora = new Date();
  const horaActual = ahora.toLocaleTimeString('es-ES', {
    timeZone: 'America/Bogota',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  console.log('\n🕐 === HORA ACTUAL ===');
  console.log('Hora actual en Colombia:', horaActual);
  
  // Si la hora actual está entre 20:20 y 21:20, debería estar "En progreso"
  const horaActualNum = parseInt(horaActual.split(':')[0]) * 60 + parseInt(horaActual.split(':')[1]);
  const horaInicioNum = 20 * 60 + 20; // 20:20
  const horaFinNum = 21 * 60 + 20;    // 21:20
  
  const enRango = horaActualNum >= horaInicioNum && horaActualNum <= horaFinNum;
  console.log('¿En rango de sesión (20:20-21:20)?', enRango ? 'SÍ' : 'NO');
  
  if (enRango) {
    console.log('🎯 Estado esperado: En progreso');
  } else if (horaActualNum < horaInicioNum) {
    console.log('🎯 Estado esperado: Pendiente');
  } else {
    console.log('🎯 Estado esperado: Finalizado');
  }
  
  return {
    fechaSesion,
    horaSesion,
    fechaAnterior,
    fechaNueva,
    fechaAnteriorColombia,
    fechaNuevaColombia,
    esCorrecto,
    horaActual,
    enRango
  };
};

// Ejecutar la prueba
const resultado = testCorreccionFinal();
console.log('\n📊 Resultado completo:', resultado);

module.exports = { testCorreccionFinal, createUTCDateFromLocal }; 