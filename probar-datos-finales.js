// ====================================
// PROBAR DATOS FINALES
// ====================================
// Ejecutar con: node probar-datos-finales.js

const fetch = require('node-fetch');

async function probarDatosFinales() {
  try {
    console.log('🔍 Probando datos finales del endpoint...');
    
    const response = await fetch('http://localhost:3000/api/participantes-reclutamiento?reclutamiento_id=06d1e93c-0b80-44c8-b105-507792c4f041');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Endpoint funcionando correctamente');
      
      if (data.participantes && data.participantes.length > 0) {
        const participante = data.participantes[0];
        console.log('\n🎯 Datos del participante:');
        console.log('- Nombre:', participante.nombre);
        console.log('- Cargo:', participante.cargo);
        console.log('- Empresa:', participante.empresa);
        console.log('- Estado reclutamiento:', participante.estado_reclutamiento?.nombre);
        console.log('- Total participaciones:', participante.total_participaciones);
        console.log('- Comentarios:', participante.comentarios);
        console.log('- Rol empresa ID:', participante.rol_empresa_id);
        console.log('- KAM ID:', participante.kam_id);
        console.log('- Productos relacionados:', participante.productos_relacionados);
        
        console.log('\n✅ Verificación de datos reales:');
        console.log('- ¿Nombre es real?', participante.nombre !== 'Sin nombre' ? '✅' : '❌');
        console.log('- ¿Cargo es real?', participante.cargo !== 'Sin cargo especificado' ? '✅' : '❌');
        console.log('- ¿Empresa es real?', participante.empresa !== 'Sin empresa asignada' ? '✅' : '❌');
        console.log('- ¿Comentarios son reales?', participante.comentarios ? '✅' : '❌');
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

probarDatosFinales(); 