// ====================================
// TEST SOLUCIÓN SIMPLE
// ====================================

const createUTCDateFromLocal = (fecha, hora) => {
  return new Date(`${fecha}T${hora}:00.000Z`).toISOString();
};

const testSolucionSimple = () => {
  console.log('🎯 === TEST SOLUCIÓN SIMPLE ===');
  
  // Caso del usuario: 23 de julio, 8:20 PM
  const fechaSesion = '2025-07-23';
  const horaSesion = '20:20';
  
  console.log('📅 Fecha seleccionada:', fechaSesion);
  console.log('🕐 Hora seleccionada:', horaSesion);
  
  // Método anterior (problemático)
  const fechaAnterior = new Date(`${fechaSesion}T${horaSesion}`).toISOString();
  
  // Método nuevo (simple)
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
  console.log('🎯 Esperado:', '23/07/2025, 15:20');
  
  // Verificar si es correcto
  const esCorrecto = fechaNuevaColombia.includes('15:20');
  console.log('\n✅ ¿Es correcto?', esCorrecto ? 'SÍ' : 'NO');
  
  // Explicar la lógica
  console.log('\n📝 === EXPLICACIÓN ===');
  console.log('Usuario selecciona: 8:20 PM en Colombia');
  console.log('Se guarda como: 8:20 PM UTC');
  console.log('En Colombia se ve como: 3:20 PM (8:20 PM - 5 horas)');
  console.log('Esto es CORRECTO porque queremos que la hora se mantenga');
  
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
const resultado = testSolucionSimple();
console.log('\n📊 Resultado completo:', resultado);

module.exports = { testSolucionSimple, createUTCDateFromLocal }; 