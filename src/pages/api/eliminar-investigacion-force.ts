import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Crear cliente con service role key para evitar problemas de permisos
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { investigacionId } = req.body;

  if (!investigacionId) {
    return res.status(400).json({ error: 'investigacionId es requerido' });
  }

  try {
    console.log('🧹 Eliminación forzada de investigación:', investigacionId);

    const resultados = {};

    // 1. Verificar si la investigación existe
    const { data: investigacion, error: errorCheck } = await supabaseAdmin
      .from('investigaciones')
      .select('id, nombre')
      .eq('id', investigacionId)
      .single();

    if (errorCheck || !investigacion) {
      return res.status(404).json({ error: 'Investigación no encontrada' });
    }

    console.log('✅ Investigación encontrada:', investigacion.nombre);

    // 2. Eliminar dependencias usando service role
    console.log('🗑️ Eliminando dependencias con service role...');
    
    // Eliminar log_actividades_investigacion
    const { error: errorLog } = await supabaseAdmin
      .from('log_actividades_investigacion')
      .delete()
      .eq('investigacion_id', investigacionId);

    if (errorLog) {
      console.error('❌ Error eliminando log actividades:', errorLog);
      resultados['error_log_actividades'] = errorLog;
    } else {
      console.log('✅ Log actividades eliminadas');
      resultados['log_actividades_eliminadas'] = true;
    }

    // Eliminar seguimientos_investigacion
    const { error: errorSeg } = await supabaseAdmin
      .from('seguimientos_investigacion')
      .delete()
      .eq('investigacion_id', investigacionId);

    if (errorSeg) {
      console.error('❌ Error eliminando seguimientos:', errorSeg);
      resultados['error_seguimientos'] = errorSeg;
    } else {
      console.log('✅ Seguimientos eliminados');
      resultados['seguimientos_eliminados'] = true;
    }

    // Eliminar reclutamientos
    const { error: errorRec } = await supabaseAdmin
      .from('reclutamientos')
      .delete()
      .eq('investigacion_id', investigacionId);

    if (errorRec) {
      console.error('❌ Error eliminando reclutamientos:', errorRec);
      resultados['error_reclutamientos'] = errorRec;
    } else {
      console.log('✅ Reclutamientos eliminados');
      resultados['reclutamientos_eliminados'] = true;
    }

    // 3. Eliminar la investigación usando service role
    console.log('🗑️ Eliminando investigación con service role...');
    const { error: errorInv } = await supabaseAdmin
      .from('investigaciones')
      .delete()
      .eq('id', investigacionId);

    if (errorInv) {
      console.error('❌ Error eliminando investigación:', errorInv);
      resultados['error_investigacion'] = errorInv;
      
      // Si aún falla, intentar con SQL directo
      console.log('🔄 Intentando con SQL directo...');
      const { error: sqlError } = await supabaseAdmin
        .rpc('exec_sql', {
          sql: `DELETE FROM investigaciones WHERE id = '${investigacionId}';`
        });
      
      if (sqlError) {
        console.error('❌ Error en SQL directo:', sqlError);
        resultados['error_sql_directo'] = sqlError;
      } else {
        console.log('✅ Investigación eliminada con SQL directo');
        resultados['investigacion_eliminada_sql'] = true;
      }
    } else {
      console.log('✅ Investigación eliminada exitosamente');
      resultados['investigacion_eliminada'] = true;
    }

    const resultadoFinal = {
      investigacionId,
      nombre_investigacion: investigacion.nombre,
      eliminacion: resultados,
      timestamp: new Date().toISOString()
    };

    console.log('🎯 Resultado final de eliminación forzada:', resultadoFinal);

    res.status(200).json(resultadoFinal);

  } catch (error) {
    console.error('❌ Error general:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error });
  }
} 