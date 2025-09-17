import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🧪 [AI Test] Verificando conectividad y tablas...');

    // Verificar conectividad a Supabase
    const { data: testData, error: testError } = await supabaseServer
      .from('ai_runs')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ [AI Test] Error conectando a Supabase:', testError);
      return res.status(500).json({ 
        error: 'Error conectando a Supabase',
        details: testError.message
      });
    }

    // Verificar que las tablas existen
    const tables = [
      'ai_runs',
      'insights', 
      'perfiles_clientes',
      'categorias_dolores',
      'transcripciones_sesiones',
      'notas_manuales'
    ];

    const tableStatus = {};
    
    for (const table of tables) {
      try {
        const { error } = await supabaseServer
          .from(table)
          .select('count')
          .limit(1);
        
        tableStatus[table] = error ? 'error' : 'ok';
        if (error) {
          console.error(`❌ [AI Test] Error en tabla ${table}:`, error.message);
        }
      } catch (err) {
        tableStatus[table] = 'error';
        console.error(`❌ [AI Test] Error verificando tabla ${table}:`, err);
      }
    }

    // Verificar variables de entorno
    const envVars = {
      IA_ENABLE_EXEC: process.env.IA_ENABLE_EXEC,
      IA_FEATURE_ANALYZE_SESSION: process.env.IA_FEATURE_ANALYZE_SESSION,
      IA_TEXT_PROVIDER: process.env.IA_TEXT_PROVIDER,
      IA_LOCAL_MODEL: process.env.IA_LOCAL_MODEL,
      OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL,
    };

    // Verificar categorías disponibles
    const { data: categoriasDolores, error: categoriasError } = await supabaseServer
      .from('categorias_dolores')
      .select('id, nombre')
      .eq('activo', true)
      .limit(5);

    const categoriasPerfil = [
      'comunicacion',
      'comportamiento', 
      'proveedores',
      'decisiones',
      'cultura'
    ];

    console.log('✅ [AI Test] Verificación completada');

    return res.status(200).json({
      status: 'ok',
      message: 'Sistema de IA verificado correctamente',
      supabase: 'connected',
      tables: tableStatus,
      envVars,
      categorias: {
        dolores: categoriasDolores || [],
        perfilamientos: categoriasPerfil
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [AI Test] Error en verificación:', error);
    return res.status(500).json({ 
      error: 'Error en verificación del sistema',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
