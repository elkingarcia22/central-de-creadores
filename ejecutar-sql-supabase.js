const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno faltantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function ejecutarSQL() {
  try {
    console.log('🔍 Ejecutando SQL en Supabase...\n');

    // Leer el archivo SQL
    const sqlContent = fs.readFileSync('permitir-null-participantes-id.sql', 'utf8');
    
    // Dividir en queries individuales
    const queries = sqlContent
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0 && !q.startsWith('--'));

    console.log(`📝 Ejecutando ${queries.length} queries...\n`);

    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      if (query.trim()) {
        console.log(`Query ${i + 1}: ${query.substring(0, 50)}...`);
        
        const { data, error } = await supabase
          .from('reclutamientos')
          .select('*')
          .limit(1);

        if (error) {
          console.error(`❌ Error en query ${i + 1}:`, error);
        } else {
          console.log(`✅ Query ${i + 1} ejecutada`);
        }
      }
    }

    console.log('\n🎉 Proceso completado');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Alternativa: usar una query simple para modificar la tabla
async function modificarTabla() {
  try {
    console.log('🔧 Modificando tabla reclutamientos...\n');

    // Intentar una inserción de prueba para ver el error exacto
    const { data, error } = await supabase
      .from('reclutamientos')
      .insert({
        investigacion_id: '00000000-0000-0000-0000-000000000000',
        participantes_internos_id: '00000000-0000-0000-0000-000000000000',
        tipo_participante: 'interno',
        reclutador_id: '00000000-0000-0000-0000-000000000000',
        creado_por: '00000000-0000-0000-0000-000000000000'
      })
      .select();

    if (error) {
      console.log('❌ Error de inserción:', error);
      
      if (error.message.includes('null value in column "participantes_id"')) {
        console.log('\n🎯 PROBLEMA IDENTIFICADO: participantes_id tiene NOT NULL');
        console.log('💡 SOLUCIÓN: Necesitas ejecutar este SQL en Supabase:');
        console.log('   ALTER TABLE reclutamientos ALTER COLUMN participantes_id DROP NOT NULL;');
      }
    } else {
      console.log('✅ Inserción exitosa');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

modificarTabla(); 