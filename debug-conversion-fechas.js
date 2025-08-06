// ====================================
// DEBUG CONVERSIÓN DE FECHAS
// ====================================

const debugConversionFechas = () => {
  console.log('🔍 === DEBUG CONVERSIÓN DE FECHAS ===');
  
  // Simular el proceso del frontend
  const fechaSesion = '2025-07-23';
  const horaSesion = '20:20';
  
  console.log('📅 Fecha seleccionada:', fechaSesion);
  console.log('🕐 Hora seleccionada:', horaSesion);
  
  // Combinar fecha y hora (como hace el frontend)
  const fechaHoraCompleta = new Date(`${fechaSesion}T${horaSesion}`).toISOString();
  console.log('🔗 Fecha + Hora combinadas:', `${fechaSesion}T${horaSesion}`);
  console.log('📤 Enviado al servidor (ISO):', fechaHoraCompleta);
  
  // Verificar zona horaria
  const fechaLocal = new Date(`${fechaSesion}T${horaSesion}`);
  console.log('📍 Fecha local (navegador):', fechaLocal.toString());
  console.log('🌍 Zona horaria navegador:', Intl.DateTimeFormat().resolvedOptions().timeZone);
  
  // Convertir a Colombia
  const fechaColombia = fechaLocal.toLocaleString('es-ES', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  console.log('🇨🇴 Fecha en Colombia:', fechaColombia);
  
  // Problema: cuando se crea new Date('2025-07-23T20:20')
  // JavaScript lo interpreta como hora local, no UTC
  console.log('\n⚠️ === PROBLEMA IDENTIFICADO ===');
  console.log('Cuando se crea: new Date("2025-07-23T20:20")');
  console.log('JavaScript lo interpreta como hora LOCAL, no UTC');
  console.log('Si estás en UTC-5, 20:20 local = 01:20 UTC del día siguiente');
  
  // Solución: especificar que es UTC
  const fechaHoraUTC = new Date(`${fechaSesion}T${horaSesion}:00.000Z`);
  console.log('\n✅ === SOLUCIÓN ===');
  console.log('Fecha con Z (UTC):', fechaHoraUTC.toISOString());
  console.log('Fecha en Colombia:', fechaHoraUTC.toLocaleString('es-ES', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }));
  
  // Comparar resultados
  console.log('\n📊 === COMPARACIÓN ===');
  console.log('Sin Z (local):', fechaHoraCompleta);
  console.log('Con Z (UTC):', fechaHoraUTC.toISOString());
  console.log('Diferencia:', new Date(fechaHoraCompleta).getTime() - fechaHoraUTC.getTime(), 'ms');
  
  return {
    fechaSesion,
    horaSesion,
    fechaHoraCompleta,
    fechaHoraUTC: fechaHoraUTC.toISOString(),
    diferencia: new Date(fechaHoraCompleta).getTime() - fechaHoraUTC.getTime()
  };
};

// Ejecutar la prueba
const resultado = debugConversionFechas();
console.log('\n📊 Resultado completo:', resultado);

module.exports = { debugConversionFechas }; 