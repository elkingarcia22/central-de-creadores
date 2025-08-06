// ====================================
// PROBAR ENDPOINT FINAL
// ====================================
// Ejecutar con: node probar-endpoint-final.js

const fetch = require('node-fetch');

async function probarEndpoint() {
  try {
    console.log('🔍 Probando endpoint de participantes...');
    
    const response = await fetch('http://localhost:3000/api/participantes-reclutamiento?reclutamiento_id=06d1e93c-0b80-44c8-b105-507792c4f041');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Endpoint funcionando correctamente');
      console.log('📋 Datos obtenidos:', JSON.stringify(data, null, 2));
      
      if (data.participantes && data.participantes.length > 0) {
        const participante = data.participantes[0];
        console.log('\n🎯 Primer participante:');
        console.log('- Nombre:', participante.nombre);
        console.log('- Cargo:', participante.cargo);
        console.log('- Empresa:', participante.empresa);
        console.log('- Estado:', participante.estado_reclutamiento?.nombre);
        console.log('- Total participaciones:', participante.total_participaciones);
      }
    } else {
      console.error('❌ Error en el endpoint:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Detalles:', errorText);
    }
  } catch (error) {
    console.error('❌ Error al probar endpoint:', error.message);
  }
}

probarEndpoint(); 