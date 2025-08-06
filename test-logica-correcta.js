// ====================================
// TEST LÓGICA CORRECTA
// ====================================

const createUTCDateFromLocal = (fecha, hora) => {
  const fechaLocal = new Date(`${fecha}T${hora}:00`);
  return fechaLocal.toISOString();
};

const testLogicaCorrecta = () => {
  console.log('🎯 === TEST LÓGICA CORRECTA ===');
  
  // Caso del usuario: 23 de julio, 8:20 PM
  const fechaSesion = '2025-07-23';
  const horaSesion = '20:20';
  
  console.log('📅 Fecha seleccionada:', fechaSesion);
  console.log('🕐 Hora seleccionada:', horaSesion);
  
  // Método corregido
  const fechaCorregida = createUTCDateFromLocal(fechaSesion, horaSesion);
  
  console.log('\n📊 === RESULTADO ===');
  console.log('✅ Fecha UTC guardada:', fechaCorregida);
  
  // Verificar en Colombia
  const fechaColombia = new Date(fechaCorregida).toLocaleString('es-ES', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  console.log('🇨🇴 En Colombia se ve como:', fechaColombia);
  console.log('🎯 Esperado:', '23/07/2025, 20:20');
  
  // Verificar si es correcto
  const esCorrecto = fechaColombia.includes('20:20');
  console.log('\n✅ ¿Es correcto?', esCorrecto ? 'SÍ' : 'NO');
  
  // Probar con diferentes horas
  console.log('\n🧪 === PRUEBAS ADICIONALES ===');
  const horasPrueba = ['09:00', '12:30', '15:45', '18:20', '22:00'];
  
  horasPrueba.forEach(hora => {
    const fechaPrueba = createUTCDateFromLocal(fechaSesion, hora);
    const fechaPruebaColombia = new Date(fechaPrueba).toLocaleString('es-ES', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    console.log(`🕐 ${hora} → ${fechaPruebaColombia}`);
  });
  
  // Verificar el estado actual
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
    fechaCorregida,
    fechaColombia,
    esCorrecto,
    horaActual,
    enRango
  };
};

// Ejecutar la prueba
const resultado = testLogicaCorrecta();
console.log('\n📊 Resultado completo:', resultado);

module.exports = { testLogicaCorrecta, createUTCDateFromLocal }; 