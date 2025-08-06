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
    console.log('🧹 Eliminación completa de investigación:', investigacionId);

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

    // 2. Eliminar log_actividades_investigacion
    console.log('🗑️ Eliminando log_actividades_investigacion...');
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

    // 3. Eliminar seguimientos_investigacion
    console.log('🗑️ Eliminando seguimientos_investigacion...');
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

    // 4. Eliminar reclutamientos (esto también eliminará participantes asociados)
    console.log('🗑️ Eliminando reclutamientos...');
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

    // 5. Verificar si hay participantes_internos (sin investigacion_id)
    console.log('🔍 Verificando participantes_internos...');
    const { data: participantesInternos, error: errorPartCheck } = await supabase
      .from('participantes_internos')
      .select('id, nombre')
      .limit(1);

    if (!errorPartCheck && participantesInternos) {
      console.log('ℹ️ Tabla participantes_internos existe, pero no tiene investigacion_id');
    }

    // 6. Ahora intentar eliminar la investigación
    console.log('🗑️ Eliminando investigación...');
    const { error: errorInv } = await supabase
      .from('investigaciones')
      .delete()
      .eq('id', investigacionId);

    if (errorInv) {
      console.error('❌ Error eliminando investigación:', errorInv);
      resultados['error_investigacion'] = errorInv;
      
      // Si aún hay error, intentar con la función simple final
      console.log('🔄 Intentando con eliminación final simple...');
      const { data: resultadoFinal, error: errorFinal } = await supabase
        .rpc('eliminar_investigacion_final', { inv_id: investigacionId });
      
      if (errorFinal) {
        console.error('❌ Error en eliminación final:', errorFinal);
        resultados['error_eliminacion_final'] = errorFinal;
        
        // Último intento con eliminación sin log
        console.log('🔄 Intentando con eliminación sin log...');
        const { data: resultadoSinLog, error: errorSinLog } = await supabase
          .rpc('eliminar_investigacion_sin_log', { inv_id: investigacionId });
        
        if (errorSinLog) {
          console.error('❌ Error en eliminación sin log:', errorSinLog);
          resultados['error_eliminacion_sin_log'] = errorSinLog;
        } else {
          console.log('✅ Eliminación sin log exitosa:', resultadoSinLog);
          resultados['eliminacion_sin_log'] = resultadoSinLog;
        }
      } else {
        console.log('✅ Eliminación final exitosa:', resultadoFinal);
        resultados['eliminacion_final'] = resultadoFinal;
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

    console.log('🎯 Resultado final de eliminación:', resultadoFinal);

    res.status(200).json(resultadoFinal);

  } catch (error) {
    console.error('❌ Error general:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error });
  }
} 