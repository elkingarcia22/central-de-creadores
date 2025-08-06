const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas');
  console.log('Asegúrate de que NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_KEY estén en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function crearVistaReclutamiento() {
  try {
    console.log('🔍 Conectando a Supabase...');
    
    // SQL para crear la vista
    const sql = `
      -- Eliminar vista anterior si existe
      DROP VIEW IF EXISTS vista_reclutamientos_completa;

      -- Crear vista final que funcione con la estructura real
      CREATE VIEW vista_reclutamientos_completa AS
      SELECT
          i.id AS reclutamiento_id,
          i.id AS investigacion_id,
          i.libreto AS libreto_id,
          i.created_at AS creado_en,
          i.updated_at AS actualizado_en,

          -- Datos de la investigación
          i.nombre AS titulo_investigacion,
          i.estado AS estado_investigacion,
          i.fecha_inicio AS fecha_inicio,
          i.fecha_fin AS fecha_fin,
          i.riesgo_automatico AS riesgo_automatico,

          -- Datos del libreto
          l.nombre AS titulo_libreto,
          l.descripcion AS descripcion_libreto,
          l.participantes_requeridos,
          
          -- Datos del producto
          p.nombre AS producto_nombre,
          
          -- Datos del tipo de investigación
          t.nombre AS tipo_investigacion_nombre,

          -- Campos calculados para compatibilidad con el frontend
          0 AS participantes_actuales,
          'Pendiente' AS estado_reclutamiento,
          '#6B7280' AS color_estado,
          1 AS orden_estado,
          'Sin asignar' AS responsable_nombre,
          NULL AS responsable_email,
          'Sin asignar' AS implementador_nombre,
          NULL AS implementador_email,
          0 AS progreso_porcentaje,
          false AS reclutamiento_completo

      FROM investigaciones i
      LEFT JOIN libretos_investigacion l ON i.libreto::uuid = l.id
      LEFT JOIN productos p ON i.producto_id = p.id
      LEFT JOIN tipos_investigacion t ON i.tipo_investigacion_id = t.id
      WHERE i.estado = 'por_agendar'
        AND i.libreto IS NOT NULL
      ORDER BY i.created_at DESC;
    `;

    console.log('📝 Ejecutando SQL para crear la vista...');
    
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('❌ Error ejecutando SQL:', error);
      
      // Intentar método alternativo
      console.log('🔄 Intentando método alternativo...');
      const { error: error2 } = await supabase.from('reclutamientos').select('*').limit(1);
      
      if (error2) {
        console.error('❌ Error de conexión:', error2);
        return;
      }
      
      console.log('✅ Conexión exitosa, pero no se pudo ejecutar SQL directamente');
      console.log('📋 Por favor, ejecuta el siguiente SQL en el panel de Supabase:');
      console.log('\n' + sql);
      return;
    }

    console.log('✅ Vista creada exitosamente');
    
    // Verificar que la vista existe
    console.log('🔍 Verificando que la vista existe...');
    const { data: testData, error: testError } = await supabase
      .from('vista_reclutamientos_completa')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('❌ Error verificando la vista:', testError);
    } else {
      console.log('✅ Vista verificada correctamente');
      console.log('📊 Datos de prueba:', testData);
    }

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

crearVistaReclutamiento(); 