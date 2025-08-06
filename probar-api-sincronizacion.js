const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function probarApiSincronizacion() {
  console.log('🧪 === PROBANDO API DE SINCRONIZACIÓN ===\n');

  try {
    // 1. Buscar un reclutamiento que esté finalizado
    const { data: reclutamientos, error: errorReclutamientos } = await supabase
      .from('reclutamientos')
      .select(`
        *,
        estado_agendamiento_cat!inner(nombre)
      `)
      .eq('estado_agendamiento_cat.nombre', 'Finalizado')
      .limit(1);

    if (errorReclutamientos) {
      console.error('❌ Error obteniendo reclutamientos:', errorReclutamientos);
      return;
    }

    if (!reclutamientos || reclutamientos.length === 0) {
      console.log('❌ No se encontraron reclutamientos finalizados para probar');
      return;
    }

    const reclutamiento = reclutamientos[0];
    console.log(`✅ Reclutamiento encontrado: ${reclutamiento.id}`);
    console.log(`   Estado: ${reclutamiento.estado_agendamiento_cat.nombre}`);
    console.log(`   Participante: ${reclutamiento.participantes_id || reclutamiento.participantes_internos_id}`);

    // 2. Verificar historial antes
    const { data: historialAntes, error: errorHistorialAntes } = await supabase
      .from('historial_participacion_participantes')
      .select('*')
      .eq('reclutamiento_id', reclutamiento.id);

    if (!errorHistorialAntes) {
      console.log(`📊 Historial antes: ${historialAntes.length} registros`);
    }

    // 3. Llamar a la API de sincronización
    console.log('\n🔄 Llamando a la API de sincronización...');
    const response = await fetch('http://localhost:3000/api/sincronizar-historico', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reclutamiento_id: reclutamiento.id
      })
    });

    if (response.ok) {
      const resultado = await response.json();
      console.log('✅ API respondió correctamente:', resultado);
    } else {
      const error = await response.text();
      console.error('❌ Error en la API:', error);
      return;
    }

    // 4. Verificar historial después
    const { data: historialDespues, error: errorHistorialDespues } = await supabase
      .from('historial_participacion_participantes')
      .select('*')
      .eq('reclutamiento_id', reclutamiento.id);

    if (!errorHistorialDespues) {
      console.log(`📊 Historial después: ${historialDespues.length} registros`);
      
      if (historialDespues.length > historialAntes.length) {
        console.log('✅ Sincronización exitosa: Se agregó un registro al historial');
        
        // Mostrar el nuevo registro
        const nuevoRegistro = historialDespues.find(h => 
          h.reclutamiento_id === reclutamiento.id
        );
        if (nuevoRegistro) {
          console.log('📋 Nuevo registro:', nuevoRegistro);
        }
      } else {
        console.log('⚠️  No se agregó ningún registro (posiblemente ya existía)');
      }
    }

    console.log('\n✅ === PRUEBA COMPLETADA ===');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

probarApiSincronizacion(); 