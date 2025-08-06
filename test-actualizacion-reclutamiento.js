// ====================================
// SCRIPT DE PRUEBA PARA ACTUALIZACIÓN DE RECLUTAMIENTOS
// ====================================

const testActualizacionReclutamiento = async () => {
  console.log('🧪 === INICIANDO PRUEBA DE ACTUALIZACIÓN ===');
  
  try {
    // 1. Obtener un reclutamiento existente para probar
    console.log('📋 Obteniendo reclutamiento existente...');
    const responseGet = await fetch('/api/reclutamientos/453ecbc8-2b12-4c0b-97c8-581dbd0c0a34');
    
    if (!responseGet.ok) {
      throw new Error(`Error obteniendo reclutamiento: ${responseGet.status}`);
    }
    
    const reclutamiento = await responseGet.json();
    console.log('✅ Reclutamiento obtenido:', reclutamiento);
    
    // 2. Preparar datos de prueba
    const fechaSesion = new Date();
    fechaSesion.setHours(fechaSesion.getHours() + 2); // 2 horas en el futuro
    
    const datosPrueba = {
      fecha_sesion: fechaSesion.toISOString(),
      duracion_sesion: 90, // 90 minutos
      reclutador_id: reclutamiento.reclutador_id // mantener el mismo reclutador
    };
    
    console.log('🔍 Datos de prueba:', datosPrueba);
    
    // 3. Probar actualización
    console.log('🔄 Probando actualización...');
    const responseUpdate = await fetch('/api/reclutamientos/453ecbc8-2b12-4c0b-97c8-581dbd0c0a34', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datosPrueba),
    });
    
    if (!responseUpdate.ok) {
      const errorData = await responseUpdate.json();
      throw new Error(`Error en actualización: ${responseUpdate.status} - ${JSON.stringify(errorData)}`);
    }
    
    const resultado = await responseUpdate.json();
    console.log('✅ Actualización exitosa:', resultado);
    
    // 4. Verificar resultado
    console.log('🔍 Verificando resultado...');
    const responseVerify = await fetch('/api/reclutamientos/453ecbc8-2b12-4c0b-97c8-581dbd0c0a34');
    
    if (!responseVerify.ok) {
      throw new Error(`Error verificando resultado: ${responseVerify.status}`);
    }
    
    const reclutamientoActualizado = await responseVerify.json();
    console.log('✅ Reclutamiento actualizado:', reclutamientoActualizado);
    
    // 5. Verificar campos específicos
    console.log('🔍 Verificando campos específicos...');
    console.log('📅 Fecha sesión original:', reclutamiento.fecha_sesion);
    console.log('📅 Fecha sesión nueva:', reclutamientoActualizado.fecha_sesion);
    console.log('⏱️ Duración original:', reclutamiento.duracion_sesion);
    console.log('⏱️ Duración nueva:', reclutamientoActualizado.duracion_sesion);
    
    // 6. Probar endpoint de prueba
    console.log('🧪 Probando endpoint de prueba...');
    const responseTest = await fetch('/api/test-reclutamiento-update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reclutamiento_id: '453ecbc8-2b12-4c0b-97c8-581dbd0c0a34',
        fecha_sesion: fechaSesion.toISOString(),
        duracion_sesion: 120
      }),
    });
    
    if (!responseTest.ok) {
      const errorData = await responseTest.json();
      console.warn('⚠️ Endpoint de prueba falló:', errorData);
    } else {
      const testResult = await responseTest.json();
      console.log('✅ Endpoint de prueba exitoso:', testResult);
    }
    
    console.log('🎉 === PRUEBA COMPLETADA EXITOSAMENTE ===');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
};

// Ejecutar prueba si estamos en el navegador
if (typeof window !== 'undefined') {
  // Agregar función al objeto window para poder ejecutarla desde la consola
  window.testActualizacionReclutamiento = testActualizacionReclutamiento;
  console.log('🧪 Función de prueba disponible. Ejecuta: testActualizacionReclutamiento()');
}

// Exportar para uso en Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testActualizacionReclutamiento };
} 