// ====================================
// PROBAR ENDPOINT SIMPLE
// ====================================
// Ejecutar con: node probar-endpoint-simple.js

const fetch = require('node-fetch');

async function probarEndpoint() {
  try {
    console.log('🔍 Probando endpoint...');
    
    const response = await fetch('http://localhost:3000/api/participantes-reclutamiento?reclutamiento_id=06d1e93c-0b80-44c8-b105-507792c4f041');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Endpoint funcionando');
      
      if (data.participantes && data.participantes.length > 0) {
        const p = data.participantes[0];
        console.log('\n📋 Datos del participante:');
        console.log('- Nombre:', p.nombre);
        console.log('- Cargo:', p.cargo);
        console.log('- Empresa:', p.empresa);
        console.log('- Estado:', p.estado_reclutamiento?.nombre);
        console.log('- Total participaciones:', p.total_participaciones);
        console.log('- Comentarios:', p.comentarios);
      }
    } else {
      console.error('❌ Error:', response.status);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

probarEndpoint(); 