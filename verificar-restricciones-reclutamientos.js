const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno faltantes');
  console.log('URL:', supabaseUrl ? '✅' : '❌');
  console.log('KEY:', supabaseKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarRestricciones() {
  try {
    console.log('🔍 Verificando restricciones de la tabla reclutamientos...\n');

    // Query SQL directa para obtener estructura
    const { data, error } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          SELECT 
            column_name,
            is_nullable,
            data_type,
            column_default
          FROM information_schema.columns 
          WHERE table_name = 'reclutamientos' 
            AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      });

    if (error) {
      console.error('❌ Error obteniendo estructura:', error);
      return;
    }

    console.log('📋 ESTRUCTURA COMPLETA DE RECLUTAMIENTOS:');
    data.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });

    console.log('\n🔍 COLUMNAS CON RESTRICCIÓN NOT NULL:');
    const notNullColumns = data.filter(col => col.is_nullable === 'NO');
    notNullColumns.forEach(col => {
      console.log(`  ❌ ${col.column_name}: ${col.data_type} NOT NULL`);
    });

    // Verificar específicamente participantes_id
    const participantesIdCol = data.find(col => col.column_name === 'participantes_id');
    if (participantesIdCol) {
      console.log(`\n🎯 PARTICIPANTES_ID: ${participantesIdCol.is_nullable === 'NO' ? '❌ NOT NULL' : '✅ NULL permitido'}`);
    }

    // Verificar participantes_internos_id
    const participantesInternosIdCol = data.find(col => col.column_name === 'participantes_internos_id');
    if (participantesInternosIdCol) {
      console.log(`🎯 PARTICIPANTES_INTERNOS_ID: ${participantesInternosIdCol.is_nullable === 'NO' ? '❌ NOT NULL' : '✅ NULL permitido'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

verificarRestricciones(); 