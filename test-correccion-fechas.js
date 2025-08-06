// ====================================
// PRUEBA CORRECCIÓN DE FECHAS
// ====================================

// Simular la función createUTCDateFromLocal
const createUTCDateFromLocal = (fecha, hora, userTimezone = 'America/Bogota') => {
  // Crear fecha en la zona horaria del usuario
  const fechaLocal = new Date(`${fecha}T${hora}:00`);
  
  // Convertir a UTC manteniendo la hora local
  const fechaUTC = new Date(fechaLocal.toLocaleString("en-US", { timeZone: userTimezone }));
  
  return fechaUTC.toISOString();
};

const testCorreccionFechas = () => {
  console.log('🔧 === PRUEBA CORRECCIÓN DE FECHAS ===');
  
  // Caso del usuario: 23 de julio, 8:20 PM
  const fechaSesion = '2025-07-23';
  const horaSesion = '20:20';
  
  console.log('📅 Fecha seleccionada:', fechaSesion);
  console.log('🕐 Hora seleccionada:', horaSesion);
  
  // Método anterior (problemático)
  const fechaAnterior = new Date(`${fechaSesion}T${horaSesion}`).toISOString();
  console.log('\n❌ Método anterior:', fechaAnterior);
  
  // Método nuevo (corregido)
  const fechaNueva = createUTCDateFromLocal(fechaSesion, horaSesion);
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
  
  console.log('\n🇨🇴 === COMPARACIÓN EN COLOMBIA ===');
  console.log('❌ Método anterior en Colombia:', fechaAnteriorColombia);
  console.log('✅ Método nuevo en Colombia:', fechaNuevaColombia);
  console.log('🎯 Hora esperada en Colombia:', '23/07/2025, 20:20');
  
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
const resultado = testCorreccionFechas();
console.log('\n📊 Resultado completo:', resultado);

module.exports = { testCorreccionFechas, createUTCDateFromLocal }; 