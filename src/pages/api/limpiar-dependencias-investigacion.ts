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
    console.log('🧹 Limpiando dependencias para investigación:', investigacionId);

    const resultados = {};

    // 1. Eliminar log_actividades_investigacion
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

    // 2. Eliminar seguimientos_investigacion
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

    // 3. Eliminar participantes_internos
    console.log('🗑️ Eliminando participantes_internos...');
    const { error: errorPart } = await supabase
      .from('participantes_internos')
      .delete()
      .eq('investigacion_id', investigacionId);

    if (errorPart) {
      console.error('❌ Error eliminando participantes internos:', errorPart);
      resultados['error_participantes_internos'] = errorPart;
    } else {
      console.log('✅ Participantes internos eliminados');
      resultados['participantes_internos_eliminados'] = true;
    }

    // 4. Eliminar reclutamientos
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

    // 5. Ahora intentar eliminar la investigación
    console.log('🗑️ Eliminando investigación...');
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

    const resultadoFinal = {
      investigacionId,
      limpieza: resultados,
      timestamp: new Date().toISOString()
    };

    console.log('🎯 Resultado final de limpieza:', resultadoFinal);

    res.status(200).json(resultadoFinal);

  } catch (error) {
    console.error('❌ Error general:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error });
  }
} 