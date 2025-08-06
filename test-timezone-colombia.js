// ====================================
// SCRIPT DE PRUEBA PARA ZONA HORARIA COLOMBIA
// ====================================

const testTimezoneColombia = () => {
  console.log('🌍 === PRUEBA DE ZONA HORARIA COLOMBIA ===');
  
  // 1. Información del navegador
  console.log('📱 Información del navegador:');
  console.log('📍 Zona horaria:', Intl.DateTimeFormat().resolvedOptions().timeZone);
  console.log('🌐 Idioma:', navigator.language);
  console.log('🏳️ País:', navigator.language.split('-')[1] || 'No detectado');
  
  // 2. Fechas en diferentes formatos
  const now = new Date();
  console.log('\n📅 Fechas en diferentes formatos:');
  console.log('🕐 Fecha local:', now.toString());
  console.log('🌍 Fecha UTC:', now.toUTCString());
  console.log('📊 Fecha ISO:', now.toISOString());
  
  // 3. Formateo específico para Colombia
  console.log('\n🇨🇴 Formateo para Colombia:');
  console.log('📅 Fecha completa:', now.toLocaleDateString('es-CO', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }));
  
  console.log('🕐 Hora completa:', now.toLocaleTimeString('es-CO', {
    timeZone: 'America/Bogota',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }));
  
  // 4. Comparación con zona horaria local
  console.log('\n🔍 Comparación de zonas horarias:');
  console.log('📍 Local:', now.toLocaleString('es-CO'));
  console.log('🇨🇴 Bogotá:', now.toLocaleString('es-CO', { timeZone: 'America/Bogota' }));
  console.log('🇺🇸 Nueva York:', now.toLocaleString('es-CO', { timeZone: 'America/New_York' }));
  console.log('🇪🇸 Madrid:', now.toLocaleString('es-CO', { timeZone: 'Europe/Madrid' }));
  
  // 5. Offset de zona horaria
  console.log('\n⏰ Offset de zona horaria:');
  const offsetMinutes = now.getTimezoneOffset();
  const offsetHours = Math.abs(offsetMinutes / 60);
  const offsetSign = offsetMinutes > 0 ? '-' : '+';
  console.log(`📍 Offset actual: ${offsetSign}${offsetHours}:${String(Math.abs(offsetMinutes % 60)).padStart(2, '0')}`);
  console.log(`📍 Offset en minutos: ${offsetMinutes}`);
  
  // 6. Prueba de conversión de fechas
  console.log('\n🔄 Prueba de conversión:');
  const testDate = '2025-07-23T08:08:00.000Z';
  const testDateObj = new Date(testDate);
  
  console.log('📅 Fecha original (UTC):', testDate);
  console.log('🇨🇴 En Bogotá:', testDateObj.toLocaleString('es-CO', { timeZone: 'America/Bogota' }));
  console.log('📍 En local:', testDateObj.toLocaleString('es-CO'));
  
  // 7. Función para obtener fecha y hora actual en Colombia
  const getColombiaDateTime = () => {
    const now = new Date();
    const date = now.toLocaleDateString('es-CO', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).split('/').reverse().join('-');
    
    const time = now.toLocaleTimeString('es-CO', {
      timeZone: 'America/Bogota',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    return { date, time };
  };
  
  const colombiaDateTime = getColombiaDateTime();
  console.log('\n🇨🇴 Fecha y hora actual en Colombia:');
  console.log('📅 Fecha:', colombiaDateTime.date);
  console.log('🕐 Hora:', colombiaDateTime.time);
  
  console.log('\n✅ === PRUEBA COMPLETADA ===');
};

// Ejecutar si estamos en el navegador
if (typeof window !== 'undefined') {
  window.testTimezoneColombia = testTimezoneColombia;
  console.log('🌍 Función de prueba disponible. Ejecuta: testTimezoneColombia()');
  
  // Ejecutar automáticamente
  testTimezoneColombia();
}

// Exportar para uso en Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testTimezoneColombia };
} 