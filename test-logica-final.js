// ====================================
// TEST LÓGICA FINAL
// ====================================

const createUTCDateFromLocal = (fecha, hora) => {
  const fechaLocal = new Date(`${fecha}T${hora}:00`);
  const offsetMs = fechaLocal.getTimezoneOffset() * 60 * 1000;
  const fechaUTC = new Date(fechaLocal.getTime() + offsetMs);
  return fechaUTC.toISOString();
};

const testLogicaFinal = () => {
  console.log('🎯 === TEST LÓGICA FINAL ===');
  
  // Caso del usuario: 23 de julio, 8:20 PM
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
  
  return {
    fechaSesion,
    horaSesion,
    fechaAnterior,
    fechaNueva,
    fechaAnteriorColombia,
    fechaNuevaColombia,
    esCorrecto
  };
};

// Ejecutar la prueba
const resultado = testLogicaFinal();
console.log('\n📊 Resultado completo:', resultado);

module.exports = { testLogicaFinal, createUTCDateFromLocal }; 