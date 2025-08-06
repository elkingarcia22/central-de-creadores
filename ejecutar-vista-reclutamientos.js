const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configurar Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function ejecutarVistaReclutamientos() {
  try {
    console.log('🔄 Ejecutando vista de reclutamientos...');
    
    // Leer el archivo SQL
    const sqlContent = fs.readFileSync('crear-vista-reclutamientos-completa.sql', 'utf8');
    
    // Ejecutar el SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ Error ejecutando SQL:', error);
      return;
    }
    
    console.log('✅ Vista de reclutamientos creada exitosamente');
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  ejecutarVistaReclutamientos();
}

module.exports = { ejecutarVistaReclutamientos }; 