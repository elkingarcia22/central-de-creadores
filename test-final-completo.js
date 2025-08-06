// ====================================
// TEST FINAL COMPLETO
// ====================================

const testFinalCompleto = () => {
  console.log('🎯 === TEST FINAL COMPLETO ===');
  
  // Función corregida
  const createUTCDateFromLocal = (fecha, hora) => {
    const fechaLocal = new Date(`${fecha}T${hora}:00`);
    return fechaLocal.toISOString();
  };
  
  // Caso del usuario: 23 de julio, 8:20 PM
  const fechaSesion = '2025-07-23';
  const horaSesion = '20:20';
  const duracionMinutos = 60;
  
  console.log('📅 Fecha seleccionada:', fechaSesion);
  console.log('🕐 Hora seleccionada:', horaSesion);
  console.log('⏱️ Duración:', duracionMinutos, 'minutos');
  
  // 1. Probar conversión de fechas
  console.log('\n1️⃣ === PRUEBA CONVERSIÓN FECHAS ===');
  const fechaUTC = createUTCDateFromLocal(fechaSesion, horaSesion);
  console.log('✅ Fecha UTC generada:', fechaUTC);
  
  // 2. Verificar en Colombia
  const fechaColombia = new Date(fechaUTC).toLocaleString('es-ES', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  console.log('🇨🇴 En Colombia se ve como:', fechaColombia);
  
  // 3. Calcular fin de sesión
  const fechaInicio = new Date(fechaUTC);
  const fechaFin = new Date(fechaInicio.getTime() + (duracionMinutos * 60 * 1000));
  const fechaFinColombia = fechaFin.toLocaleString('es-ES', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  console.log('🏁 Fin de sesión en Colombia:', fechaFinColombia);
  
  // 4. Verificar estado actual
  console.log('\n2️⃣ === PRUEBA ESTADO ACTUAL ===');
  const ahora = new Date();
  const horaActual = ahora.toLocaleTimeString('es-ES', {
    timeZone: 'America/Bogota',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  console.log('🕐 Hora actual en Colombia:', horaActual);
  
  // Convertir fechas a Colombia para comparación
  const fechaInicioColombia = fechaInicio.toLocaleString("en-US", { timeZone: "America/Bogota" });
  const fechaFinColombia2 = fechaFin.toLocaleString("en-US", { timeZone: "America/Bogota" });
  const ahoraColombia = ahora.toLocaleString("en-US", { timeZone: "America/Bogota" });
  
  const fechaInicioCol = new Date(fechaInicioColombia);
  const fechaFinCol2 = new Date(fechaFinColombia2);
  const ahoraCol = new Date(ahoraColombia);
  
  console.log('🎯 Inicio sesión (Colombia):', fechaInicioCol.toLocaleString('es-ES', { timeZone: 'America/Bogota' }));
  console.log('🏁 Fin sesión (Colombia):', fechaFinCol2.toLocaleString('es-ES', { timeZone: 'America/Bogota' }));
  
  // Determinar estado
  let estado;
  if (ahoraCol < fechaInicioCol) {
    estado = 'Pendiente';
  } else if (ahoraCol >= fechaInicioCol && ahoraCol <= fechaFinCol2) {
    estado = 'En progreso';
  } else {
    estado = 'Finalizado';
  }
  
  console.log('📋 Estado calculado:', estado);
  
  // 5. Verificar si es correcto
  console.log('\n3️⃣ === VERIFICACIÓN FINAL ===');
  const horaActualNum = parseInt(horaActual.split(':')[0]) * 60 + parseInt(horaActual.split(':')[1]);
  const horaInicioNum = 20 * 60 + 20; // 20:20
  const horaFinNum = 21 * 60 + 20;    // 21:20
  
  const enRango = horaActualNum >= horaInicioNum && horaActualNum <= horaFinNum;
  console.log('¿En rango de sesión (20:20-21:20)?', enRango ? 'SÍ' : 'NO');
  
  const estadoEsperado = enRango ? 'En progreso' : (horaActualNum < horaInicioNum ? 'Pendiente' : 'Finalizado');
  console.log('Estado esperado:', estadoEsperado);
  console.log('¿Estado correcto?', estado === estadoEsperado ? '✅ SÍ' : '❌ NO');
  
  // 6. Resumen
  console.log('\n📊 === RESUMEN FINAL ===');
  console.log('Usuario selecciona: 23 de julio, 8:20 PM (Colombia)');
  console.log('Se guarda como:', fechaUTC);
  console.log('En Colombia se ve como:', fechaColombia);
  console.log('Duración: 60 minutos');
  console.log('Fin de sesión en Colombia:', fechaFinColombia);
  console.log('Hora actual en Colombia:', horaActual);
  console.log('Estado calculado:', estado);
  console.log('Estado esperado:', estadoEsperado);
  
  return {
    fechaSesion,
    horaSesion,
    duracionMinutos,
    fechaUTC,
    fechaColombia,
    fechaFinColombia,
    horaActual,
    estado,
    estadoEsperado,
    esCorrecto: estado === estadoEsperado
  };
};

// Ejecutar la prueba
const resultado = testFinalCompleto();
console.log('\n📊 Resultado completo:', resultado);

module.exports = { testFinalCompleto }; 