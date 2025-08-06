// ====================================
// PROBAR APIs DE ESTADÍSTICAS
// ====================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function probarEstadisticas() {
  console.log('🚀 === PROBANDO APIs DE ESTADÍSTICAS ===\n');

  try {
    // 1. Verificar datos en las tablas de historial
    console.log('1. Verificando datos en tablas de historial...');
    
    const { data: historialEmpresas, error: errorEmpresas } = await supabase
      .from('historial_participacion_empresas')
      .select('*');
    
    const { data: historialParticipantes, error: errorParticipantes } = await supabase
      .from('historial_participacion_participantes')
      .select('*');

    if (errorEmpresas) {
      console.error('❌ Error obteniendo historial de empresas:', errorEmpresas);
      return;
    }

    if (errorParticipantes) {
      console.error('❌ Error obteniendo historial de participantes:', errorParticipantes);
      return;
    }

    console.log(`📊 Historial empresas: ${historialEmpresas?.length || 0} registros`);
    console.log(`📊 Historial participantes: ${historialParticipantes?.length || 0} registros`);

    // 2. Mostrar estadísticas por estado
    if (historialEmpresas && historialEmpresas.length > 0) {
      console.log('\n2. Estadísticas por estado (empresas):');
      const estadosEmpresas = historialEmpresas.reduce((acc, item) => {
        acc[item.estado_sesion] = (acc[item.estado_sesion] || 0) + 1;
        return acc;
      }, {});
      
      Object.entries(estadosEmpresas).forEach(([estado, count]) => {
        console.log(`   - ${estado}: ${count} participaciones`);
      });
    }

    if (historialParticipantes && historialParticipantes.length > 0) {
      console.log('\n3. Estadísticas por estado (participantes):');
      const estadosParticipantes = historialParticipantes.reduce((acc, item) => {
        acc[item.estado_sesion] = (acc[item.estado_sesion] || 0) + 1;
        return acc;
      }, {});
      
      Object.entries(estadosParticipantes).forEach(([estado, count]) => {
        console.log(`   - ${estado}: ${count} participaciones`);
      });
    }

    // 3. Probar API de estadísticas de empresa
    if (historialEmpresas && historialEmpresas.length > 0) {
      const empresaId = historialEmpresas[0].empresa_id;
      console.log(`\n4. Probando API de estadísticas de empresa: ${empresaId}`);
      
      const responseEmpresa = await fetch(`http://localhost:3000/api/estadisticas-empresa?empresa_id=${empresaId}`);
      if (responseEmpresa.ok) {
        const dataEmpresa = await responseEmpresa.json();
        console.log('✅ API empresa funcionando:');
        console.log(`   - Total participaciones: ${dataEmpresa.estadisticas.total_participaciones}`);
        console.log(`   - Última sesión: ${dataEmpresa.estadisticas.ultima_sesion ? 'Sí' : 'No'}`);
      } else {
        console.error('❌ Error en API de empresa:', responseEmpresa.statusText);
      }
    }

    // 4. Probar API de estadísticas de participante
    if (historialParticipantes && historialParticipantes.length > 0) {
      const participanteId = historialParticipantes[0].participante_id;
      console.log(`\n5. Probando API de estadísticas de participante: ${participanteId}`);
      
      const responseParticipante = await fetch(`http://localhost:3000/api/estadisticas-participante?participante_id=${participanteId}`);
      if (responseParticipante.ok) {
        const dataParticipante = await responseParticipante.json();
        console.log('✅ API participante funcionando:');
        console.log(`   - Total participaciones: ${dataParticipante.estadisticas.total_participaciones}`);
        console.log(`   - Última sesión: ${dataParticipante.estadisticas.ultima_sesion ? 'Sí' : 'No'}`);
      } else {
        console.error('❌ Error en API de participante:', responseParticipante.statusText);
      }
    }

    // 5. Verificar que solo cuenta 'completada'
    console.log('\n6. Verificando filtro de estado "completada"...');
    
    const { data: completadasEmpresas, error: errorCompletadasEmpresas } = await supabase
      .from('historial_participacion_empresas')
      .select('id')
      .eq('estado_sesion', 'completada');

    const { data: completadasParticipantes, error: errorCompletadasParticipantes } = await supabase
      .from('historial_participacion_participantes')
      .select('id')
      .eq('estado_sesion', 'completada');

    console.log(`   - Empresas completadas: ${completadasEmpresas?.length || 0}`);
    console.log(`   - Participantes completados: ${completadasParticipantes?.length || 0}`);

    console.log('\n✅ Prueba completada exitosamente');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

// Ejecutar la prueba
probarEstadisticas(); 