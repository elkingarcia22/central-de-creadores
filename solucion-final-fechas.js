// ====================================
// SOLUCIÓN FINAL PARA FECHAS
// ====================================

const solucionFinalFechas = () => {
  console.log('🎯 === SOLUCIÓN FINAL PARA FECHAS ===');
  
  // Caso del usuario: 23 de julio, 8:20 PM
  const fechaSesion = '2025-07-23';
  const horaSesion = '20:20';
  
  console.log('📅 Fecha seleccionada:', fechaSesion);
  console.log('🕐 Hora seleccionada:', horaSesion);
  
  // PROBLEMA: JavaScript interpreta como hora local
  const fechaProblematica = new Date(`${fechaSesion}T${horaSesion}`);
  console.log('\n❌ PROBLEMA:');
  console.log('new Date("2025-07-23T20:20") =', fechaProblematica.toISOString());
  console.log('Esto es:', fechaProblematica.toString());
  
  // SOLUCIÓN 1: Especificar que es UTC
  const fechaSolucion1 = new Date(`${fechaSesion}T${horaSesion}:00.000Z`);
  console.log('\n✅ SOLUCIÓN 1 (UTC explícito):');
  console.log('new Date("2025-07-23T20:20:00.000Z") =', fechaSolucion1.toISOString());
  
  // SOLUCIÓN 2: Calcular offset manualmente
  const fechaLocal = new Date(`${fechaSesion}T${horaSesion}:00`);
  const offsetMs = fechaLocal.getTimezoneOffset() * 60 * 1000;
  const fechaSolucion2 = new Date(fechaLocal.getTime() - offsetMs);
  console.log('\n✅ SOLUCIÓN 2 (offset manual):');
  console.log('Offset en minutos:', fechaLocal.getTimezoneOffset());
  console.log('Offset en ms:', offsetMs);
  console.log('Resultado:', fechaSolucion2.toISOString());
  
  // SOLUCIÓN 3: Usar toLocaleString para convertir
  const fechaSolucion3 = new Date(fechaLocal.toLocaleString("en-US", { timeZone: "America/Bogota" }));
  console.log('\n✅ SOLUCIÓN 3 (toLocaleString):');
  console.log('Resultado:', fechaSolucion3.toISOString());
  
  // Verificar todas las soluciones en Colombia
  console.log('\n🇨🇴 === VERIFICACIÓN EN COLOMBIA ===');
  
  const verificarEnColombia = (fecha, nombre) => {
    const fechaColombia = new Date(fecha).toLocaleString('es-ES', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    console.log(`${nombre}: ${fechaColombia}`);
    return fechaColombia.includes('20:20');
  };
  
  verificarEnColombia(fechaProblematica.toISOString(), '❌ Problema');
  verificarEnColombia(fechaSolucion1.toISOString(), '✅ Solución 1');
  verificarEnColombia(fechaSolucion2.toISOString(), '✅ Solución 2');
  verificarEnColombia(fechaSolucion3.toISOString(), '✅ Solución 3');
  
  // Función final recomendada
  const createUTCDateFromLocal = (fecha, hora) => {
    const fechaLocal = new Date(`${fecha}T${hora}:00`);
    const offsetMs = fechaLocal.getTimezoneOffset() * 60 * 1000;
    return new Date(fechaLocal.getTime() - offsetMs).toISOString();
  };
  
  const fechaFinal = createUTCDateFromLocal(fechaSesion, horaSesion);
  console.log('\n🎯 === FUNCIÓN FINAL ===');
  console.log('createUTCDateFromLocal("2025-07-23", "20:20") =', fechaFinal);
  console.log('En Colombia:', new Date(fechaFinal).toLocaleString('es-ES', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }));
  
  return {
    fechaSesion,
    horaSesion,
    problema: fechaProblematica.toISOString(),
    solucion1: fechaSolucion1.toISOString(),
    solucion2: fechaSolucion2.toISOString(),
    solucion3: fechaSolucion3.toISOString(),
    final: fechaFinal
  };
};

// Ejecutar la prueba
const resultado = solucionFinalFechas();
console.log('\n📊 Resultado completo:', resultado);

module.exports = { solucionFinalFechas }; 