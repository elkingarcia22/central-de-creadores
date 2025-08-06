import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { investigacionId } = req.body;

  if (!investigacionId) {
    return res.status(400).json({ error: 'investigacionId es requerido' });
  }

  try {
    console.log('🧹 Eliminación con SQL directo de investigación:', investigacionId);

    const resultados = {};

    // 1. Verificar si la investigación existe
    const { data: investigacion, error: errorCheck } = await supabase
      .from('investigaciones')
      .select('id, nombre')
      .eq('id', investigacionId)
      .single();

    if (errorCheck || !investigacion) {
      return res.status(404).json({ error: 'Investigación no encontrada' });
    }

    console.log('✅ Investigación encontrada:', investigacion.nombre);

    // 2. Usar SQL directo para eliminar todo en una transacción
    console.log('🔄 Ejecutando SQL directo...');
    
    const { data: sqlResult, error: sqlError } = await supabase
      .rpc('exec_sql', {
        sql: `
          BEGIN;
          
          -- Eliminar dependencias
          DELETE FROM log_actividades_investigacion WHERE investigacion_id = '${investigacionId}';
          DELETE FROM seguimientos_investigacion WHERE investigacion_id = '${investigacionId}';
          DELETE FROM reclutamientos WHERE investigacion_id = '${investigacionId}';
          
          -- Eliminar la investigación
          DELETE FROM investigaciones WHERE id = '${investigacionId}';
          
          COMMIT;
        `
      });

    if (sqlError) {
      console.error('❌ Error en SQL directo:', sqlError);
      resultados['error_sql_directo'] = sqlError;
      
      // Si falla SQL directo, intentar método manual
      console.log('🔄 Intentando método manual...');
      
      // Eliminar dependencias manualmente
      const { error: errorLog } = await supabase
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

      const { error: errorSeg } = await supabase
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

      const { error: errorRec } = await supabase
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

      // Intentar eliminar la investigación
      const { error: errorInv } = await supabase
        .from('investigaciones')
        .delete()
        .eq('id', investigacionId);

      if (errorInv) {
        console.error('❌ Error eliminando investigación:', errorInv);
        resultados['error_investigacion'] = errorInv;
      } else {
        console.log('✅ Investigación eliminada exitosamente');
        resultados['investigacion_eliminada'] = true;
      }
    } else {
      console.log('✅ Eliminación con SQL directo exitosa');
      resultados['eliminacion_sql_directo'] = true;
    }

    const resultadoFinal = {
      investigacionId,
      nombre_investigacion: investigacion.nombre,
      eliminacion: resultados,
      timestamp: new Date().toISOString()
    };

    console.log('🎯 Resultado final de eliminación SQL directo:', resultadoFinal);

    res.status(200).json(resultadoFinal);

  } catch (error) {
    console.error('❌ Error general:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error });
  }
} 