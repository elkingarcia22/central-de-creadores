const fetch = require('node-fetch');

// Configuración
const BASE_URL = 'http://localhost:3000/api';

// Función para probar la API de estadísticas de participantes internos
async function probarEstadisticasParticipantesInternos() {
  console.log('🧪 === PROBANDO ESTADÍSTICAS DE PARTICIPANTES INTERNOS ===');
  
  try {
    // Primero, obtener participantes internos disponibles
    console.log('\n1. Obteniendo participantes internos...');
    const responseParticipantes = await fetch(`${BASE_URL}/participantes-internos`);
    
    if (!responseParticipantes.ok) {
      throw new Error(`Error obteniendo participantes internos: ${responseParticipantes.status}`);
    }
    
    const participantes = await responseParticipantes.json();
    console.log(`✅ Participantes internos encontrados: ${participantes.length}`);
    
    if (participantes.length === 0) {
      console.log('⚠️ No hay participantes internos para probar');
      return;
    }
    
    // Mostrar los primeros 3 participantes
    console.log('\n📋 Primeros participantes internos:');
    participantes.slice(0, 3).forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.nombre} (${p.id})`);
    });
    
    // Probar estadísticas con el primer participante
    const primerParticipante = participantes[0];
    console.log(`\n2. Probando estadísticas para: ${primerParticipante.nombre}`);
    
    const responseEstadisticas = await fetch(
      `${BASE_URL}/estadisticas-participante-interno?participante_interno_id=${primerParticipante.id}`
    );
    
    if (!responseEstadisticas.ok) {
      const errorText = await responseEstadisticas.text();
      throw new Error(`Error obteniendo estadísticas: ${responseEstadisticas.status} - ${errorText}`);
    }
    
    const estadisticas = await responseEstadisticas.json();
    console.log('✅ Estadísticas obtenidas:', estadisticas);
    
    // Probar con todos los participantes
    console.log('\n3. Probando estadísticas para todos los participantes...');
    for (const participante of participantes.slice(0, 5)) {
      try {
        const response = await fetch(
          `${BASE_URL}/estadisticas-participante-interno?participante_interno_id=${participante.id}`
        );
        
        if (response.ok) {
          const stats = await response.json();
          console.log(`  ✅ ${participante.nombre}: ${stats.total_participaciones} participaciones, última: ${stats.ultima_sesion || 'N/A'}`);
        } else {
          console.log(`  ❌ ${participante.nombre}: Error ${response.status}`);
        }
      } catch (error) {
        console.log(`  ❌ ${participante.nombre}: ${error.message}`);
      }
    }
    
    console.log('\n✅ === PRUEBA COMPLETADA ===');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// Ejecutar la prueba
probarEstadisticasParticipantesInternos(); 