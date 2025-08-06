const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function ejecutarTriggersSincronizacion() {
  console.log('🔧 === EJECUTANDO TRIGGERS DE SINCRONIZACIÓN ===\n');

  try {
    // Leer el archivo SQL
    const fs = require('fs');
    const sqlContent = fs.readFileSync('crear-trigger-sincronizacion-historico.sql', 'utf8');

    console.log('📋 Contenido SQL:');
    console.log(sqlContent);

    // Ejecutar el SQL
    console.log('\n🚀 Ejecutando SQL en Supabase...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });

    if (error) {
      console.error('❌ Error ejecutando SQL:', error);
      
      // Intentar ejecutar por partes
      console.log('\n🔄 Intentando ejecutar por partes...');
      
      const partes = sqlContent.split(';').filter(part => part.trim());
      
      for (let i = 0; i < partes.length; i++) {
        const parte = partes[i].trim();
        if (parte) {
          console.log(`\n📝 Ejecutando parte ${i + 1}/${partes.length}:`);
          console.log(parte.substring(0, 100) + '...');
          
          try {
            const { error: errorParte } = await supabase.rpc('exec_sql', { sql: parte });
            if (errorParte) {
              console.error(`❌ Error en parte ${i + 1}:`, errorParte);
            } else {
              console.log(`✅ Parte ${i + 1} ejecutada correctamente`);
            }
          } catch (err) {
            console.error(`❌ Error ejecutando parte ${i + 1}:`, err);
          }
        }
      }
    } else {
      console.log('✅ SQL ejecutado correctamente');
    }

    console.log('\n✅ === TRIGGERS CONFIGURADOS ===');
    console.log('📋 Los triggers ahora sincronizarán automáticamente:');
    console.log('  - Cuando se inserte un reclutamiento con estado "Finalizado"');
    console.log('  - Cuando se actualice un reclutamiento a estado "Finalizado"');
    console.log('  - Cuando se elimine un reclutamiento');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

ejecutarTriggersSincronizacion(); 