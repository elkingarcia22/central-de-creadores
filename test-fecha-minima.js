// ====================================
// SCRIPT DE PRUEBA PARA FECHA MÍNIMA
// ====================================

const testFechaMinima = () => {
  console.log('📅 === PRUEBA DE FECHA MÍNIMA ===');
  
  // 1. Fecha UTC (problema original)
  const fechaUTC = new Date().toISOString().slice(0, 10);
  console.log('🌍 Fecha UTC (problemática):', fechaUTC);
  
  // 2. Fecha local del navegador
  const fechaLocal = new Date().toLocaleDateString('es-ES').split('/').reverse().join('-');
  console.log('📍 Fecha local navegador:', fechaLocal);
  
  // 3. Fecha en zona horaria específica (Colombia)
  const fechaColombia = new Date().toLocaleDateString('es-ES', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).split('/').reverse().join('-');
  console.log('🇨🇴 Fecha Colombia:', fechaColombia);
  
  // 4. Comparación de fechas
  console.log('\n🔍 Comparación:');
  console.log('UTC vs Local:', fechaUTC === fechaLocal ? '✅ Iguales' : '❌ Diferentes');
  console.log('UTC vs Colombia:', fechaUTC === fechaColombia ? '✅ Iguales' : '❌ Diferentes');
  console.log('Local vs Colombia:', fechaLocal === fechaColombia ? '✅ Iguales' : '❌ Diferentes');
  
  // 5. Información de zona horaria
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  console.log('\n🌍 Zona horaria detectada:', timezone);
  
  // 6. Función para obtener fecha mínima correcta
  const getMinDateCorrecta = () => {
    const now = new Date();
    const tz = 'America/Bogota'; // Forzar Colombia
    
    const localDate = now.toLocaleDateString('es-ES', { 
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    
    const [day, month, year] = localDate.split('/');
    return `${year}-${month}-${day}`;
  };
  
  const fechaMinimaCorrecta = getMinDateCorrecta();
  console.log('✅ Fecha mínima correcta:', fechaMinimaCorrecta);
  
  // 7. Verificar si hoy es seleccionable
  const hoy = new Date().toLocaleDateString('es-ES', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).split('/').reverse().join('-');
  
  console.log('📅 Hoy en Colombia:', hoy);
  console.log('✅ ¿Hoy es seleccionable?', fechaMinimaCorrecta === hoy ? 'SÍ' : 'NO');
  
  // 8. Crear un input de prueba
  console.log('\n🧪 Creando input de prueba...');
  const testInput = document.createElement('input');
  testInput.type = 'date';
  testInput.min = fechaMinimaCorrecta;
  testInput.value = fechaMinimaCorrecta;
  
  console.log('📅 Input min:', testInput.min);
  console.log('📅 Input value:', testInput.value);
  console.log('📅 Input minDate:', testInput.min);
  
  // 9. Verificar en el DOM
  document.body.appendChild(testInput);
  console.log('✅ Input agregado al DOM para inspección');
  
  console.log('\n🎯 === RESULTADO ===');
  console.log('La fecha mínima debe ser:', fechaMinimaCorrecta);
  console.log('Esto permitirá seleccionar el día actual en Colombia');
  
  return {
    fechaUTC,
    fechaLocal,
    fechaColombia,
    fechaMinimaCorrecta,
    hoy,
    esSeleccionable: fechaMinimaCorrecta === hoy
  };
};

// Ejecutar si estamos en el navegador
if (typeof window !== 'undefined') {
  window.testFechaMinima = testFechaMinima;
  console.log('📅 Función de prueba disponible. Ejecuta: testFechaMinima()');
  
  // Ejecutar automáticamente
  const resultado = testFechaMinima();
  console.log('📊 Resultado:', resultado);
}

// Exportar para uso en Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testFechaMinima };
} 