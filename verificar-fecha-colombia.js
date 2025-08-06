// ====================================
// VERIFICAR FECHA COLOMBIA
// ====================================

const verificarFechaColombia = () => {
  console.log('🇨🇴 === VERIFICACIÓN FECHA COLOMBIA ===');
  
  // 1. Información actual
  const now = new Date();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  console.log('📅 Fecha actual (UTC):', now.toISOString());
  console.log('🌍 Zona horaria:', timezone);
  
  // 2. Fechas en diferentes formatos
  const fechaUTC = now.toISOString().slice(0, 10);
  const fechaLocal = now.toLocaleDateString('es-ES').split('/').reverse().join('-');
  const fechaColombia = now.toLocaleDateString('es-ES', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).split('/').reverse().join('-');
  
  console.log('\n📊 Comparación de fechas:');
  console.log('🌍 UTC:', fechaUTC);
  console.log('📍 Local:', fechaLocal);
  console.log('🇨🇴 Colombia:', fechaColombia);
  
  // 3. Función getMinDate
  const getMinDate = () => {
    const now = new Date();
    const tz = 'America/Bogota';
    
    const localDate = now.toLocaleDateString('es-ES', { 
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    
    const [day, month, year] = localDate.split('/');
    return `${year}-${month}-${day}`;
  };
  
  const fechaMinima = getMinDate();
  console.log('\n✅ Fecha mínima (getMinDate):', fechaMinima);
  
  // 4. Verificar si permite seleccionar hoy
  const hoyColombia = now.toLocaleDateString('es-ES', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).split('/').reverse().join('-');
  
  console.log('📅 Hoy en Colombia:', hoyColombia);
  console.log('✅ ¿Permite seleccionar hoy?', fechaMinima === hoyColombia ? 'SÍ' : 'NO');
  
  // 5. Crear input de prueba
  const testInput = document.createElement('input');
  testInput.type = 'date';
  testInput.min = fechaMinima;
  testInput.value = fechaMinima;
  
  console.log('\n🧪 Input de prueba:');
  console.log('📅 min:', testInput.min);
  console.log('📅 value:', testInput.value);
  
  // 6. Verificar en el DOM
  document.body.appendChild(testInput);
  console.log('✅ Input agregado al DOM');
  
  // 7. Información adicional
  console.log('\n📋 Información adicional:');
  console.log('🕐 Hora actual Colombia:', now.toLocaleTimeString('es-ES', {
    timeZone: 'America/Bogota',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }));
  
  console.log('📅 Fecha completa Colombia:', now.toLocaleDateString('es-ES', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }));
  
  return {
    fechaUTC,
    fechaLocal,
    fechaColombia,
    fechaMinima,
    hoyColombia,
    permiteHoy: fechaMinima === hoyColombia,
    timezone
  };
};

// Ejecutar si estamos en el navegador
if (typeof window !== 'undefined') {
  window.verificarFechaColombia = verificarFechaColombia;
  console.log('🇨🇴 Función disponible. Ejecuta: verificarFechaColombia()');
  
  // Ejecutar automáticamente
  const resultado = verificarFechaColombia();
  console.log('\n📊 Resultado final:', resultado);
}

// Exportar para uso en Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { verificarFechaColombia };
} 