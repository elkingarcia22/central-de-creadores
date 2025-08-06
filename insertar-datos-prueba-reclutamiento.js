const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function insertarDatosPrueba() {
  try {
    console.log('🔍 Conectando a Supabase...');
    
    // Primero, obtener un usuario existente para usar como responsable e implementador
    const { data: usuarios, error: errorUsuarios } = await supabase
      .from('auth.users')
      .select('id')
      .limit(1);
    
    if (errorUsuarios) {
      console.log('⚠️ No se pudieron obtener usuarios, usando valores por defecto');
    }
    
    const usuarioId = usuarios?.[0]?.id || '00000000-0000-0000-0000-000000000000';
    
    console.log('📝 Insertando investigaciones de prueba...');
    
    // Datos de prueba para investigaciones
    const investigacionesPrueba = [
      {
        nombre: 'Estudio de Usabilidad - App Móvil',
        descripcion: 'Investigación sobre la usabilidad de la nueva aplicación móvil',
        estado: 'por_agendar',
        fecha_inicio: '2024-02-15',
        fecha_fin: '2024-03-15',
        riesgo_automatico: 'medio',
        responsable_id: usuarioId,
        implementador_id: usuarioId
      },
      {
        nombre: 'Test de Concepto - Producto Fintech',
        descripcion: 'Validación de concepto para nuevo producto financiero',
        estado: 'por_agendar',
        fecha_inicio: '2024-02-20',
        fecha_fin: '2024-03-20',
        riesgo_automatico: 'alto',
        responsable_id: usuarioId,
        implementador_id: usuarioId
      },
      {
        nombre: 'Investigación de Mercado - E-commerce',
        descripcion: 'Análisis de comportamiento de compra online',
        estado: 'por_agendar',
        fecha_inicio: '2024-02-25',
        fecha_fin: '2024-03-25',
        riesgo_automatico: 'bajo',
        responsable_id: usuarioId,
        implementador_id: usuarioId
      },
      {
        nombre: 'Test A/B - Landing Page',
        descripcion: 'Comparación de dos versiones de landing page',
        estado: 'por_agendar',
        fecha_inicio: '2024-03-01',
        fecha_fin: '2024-03-31',
        riesgo_automatico: 'medio',
        responsable_id: usuarioId,
        implementador_id: usuarioId
      },
      {
        nombre: 'Entrevistas en Profundidad - SaaS',
        descripcion: 'Entrevistas con usuarios de plataforma SaaS',
        estado: 'por_agendar',
        fecha_inicio: '2024-03-05',
        fecha_fin: '2024-04-05',
        riesgo_automatico: 'alto',
        responsable_id: usuarioId,
        implementador_id: usuarioId
      }
    ];
    
    // Insertar investigaciones
    const { data: investigacionesInsertadas, error: errorInsert } = await supabase
      .from('investigaciones')
      .insert(investigacionesPrueba)
      .select();
    
    if (errorInsert) {
      console.error('❌ Error insertando investigaciones:', errorInsert);
      return;
    }
    
    console.log('✅ Investigaciones insertadas:', investigacionesInsertadas.length);
    
    // Verificar que se insertaron correctamente
    const { data: investigacionesVerificadas, error: errorVerificacion } = await supabase
      .from('investigaciones')
      .select('*')
      .eq('estado', 'por_agendar');
    
    if (errorVerificacion) {
      console.error('❌ Error verificando investigaciones:', errorVerificacion);
      return;
    }
    
    console.log('📊 Total de investigaciones por agendar:', investigacionesVerificadas.length);
    
    // Mostrar estadísticas
    const estadisticas = {
      total: investigacionesVerificadas.length,
      por_agendar: investigacionesVerificadas.filter(inv => inv.estado === 'por_agendar').length,
      diferentes_riesgos: [...new Set(investigacionesVerificadas.map(inv => inv.riesgo_automatico))].length
    };
    
    console.log('📈 Estadísticas:', estadisticas);
    console.log('🎉 Datos de prueba insertados exitosamente!');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
insertarDatosPrueba(); 