const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);

async function verificarEstructuraParticipantes() {
  try {
    console.log('🔍 Verificando estructura de tabla participantes...');
    
    // Obtener estructura de la tabla
    const { data: estructura, error: errorEstructura } = await supabaseServer
      .from('participantes')
      .select('*')
      .limit(1);
    
    if (errorEstructura) {
      console.error('❌ Error obteniendo estructura:', errorEstructura);
      return;
    }
    
    if (estructura && estructura.length > 0) {
      console.log('📋 Campos disponibles en tabla participantes:');
      const participante = estructura[0];
      
      Object.keys(participante).forEach(campo => {
        const valor = participante[campo];
        const tipo = typeof valor;
        const esNull = valor === null;
        const esVacio = valor === '';
        const esArray = Array.isArray(valor);
        
        console.log(`  - ${campo}: ${tipo}${esArray ? ' (array)' : ''}${esNull ? ' (NULL)' : ''}${esVacio ? ' (vacío)' : ''}`);
        if (!esNull && !esVacio && !esArray) {
          console.log(`    Valor ejemplo: ${valor}`);
        } else if (esArray) {
          console.log(`    Valor ejemplo: [${valor.join(', ')}]`);
        }
      });
    }
    
    // Obtener todos los participantes para ver qué datos tienen
    console.log('\n🔍 Verificando datos de participantes...');
    const { data: participantes, error: errorParticipantes } = await supabaseServer
      .from('participantes')
      .select('*')
      .limit(5);
    
    if (errorParticipantes) {
      console.error('❌ Error obteniendo participantes:', errorParticipantes);
      return;
    }
    
    console.log(`📊 Encontrados ${participantes.length} participantes:`);
    participantes.forEach((p, index) => {
      console.log(`\n  Participante ${index + 1}:`);
      console.log(`    ID: ${p.id}`);
      console.log(`    Nombre: ${p.nombre || 'Sin nombre'}`);
      console.log(`    Email: ${p.email || 'Sin email'}`);
      console.log(`    Tipo: ${p.tipo || 'Sin tipo'}`);
      console.log(`    Rol empresa ID: ${p.rol_empresa_id || 'Sin rol'}`);
      console.log(`    Empresa ID: ${p.empresa_id || 'Sin empresa'}`);
      console.log(`    KAM ID: ${p.kam_id || 'Sin KAM'}`);
      console.log(`    Estado participante: ${p.estado_participante || 'Sin estado'}`);
      console.log(`    Productos relacionados: ${p.productos_relacionados ? JSON.stringify(p.productos_relacionados) : 'Sin productos'}`);
      console.log(`    Dolores necesidades: ${p.doleres_necesidades || 'Sin dolores'}`);
      console.log(`    Descripción: ${p.descripción || 'Sin descripción'}`);
      console.log(`    Fecha última participación: ${p.fecha_ultima_participacion || 'Sin fecha'}`);
      console.log(`    Total participaciones: ${p.total_participaciones || 0}`);
      console.log(`    Creado por: ${p.creado_por || 'Sin creador'}`);
      console.log(`    Created at: ${p.created_at || 'Sin fecha creación'}`);
      console.log(`    Updated at: ${p.updated_at || 'Sin fecha actualización'}`);
    });
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

verificarEstructuraParticipantes(); 