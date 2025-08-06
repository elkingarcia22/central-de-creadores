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
    console.log('🧹 Eliminación directa de investigación:', investigacionId);

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

    // 2. Deshabilitar el trigger problemático usando SQL directo
    console.log('🔄 Deshabilitando trigger...');
    const { error: errorDisable } = await supabase
      .rpc('exec_sql', { 
        sql: 'ALTER TABLE investigaciones DISABLE TRIGGER trigger_log_actividades_investigacion;' 
      });

    if (errorDisable) {
      console.log('⚠️ No se pudo deshabilitar trigger (puede que no exista la función):', errorDisable);
      // Continuar de todas formas
    } else {
      console.log('✅ Trigger deshabilitado');
      resultados['trigger_deshabilitado'] = true;
    }

    // 3. Eliminar dependencias en orden
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

    // 4. Eliminar la investigación
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

    // 5. Restaurar el trigger
    console.log('🔄 Restaurando trigger...');
    const { error: errorEnable } = await supabase
      .rpc('exec_sql', { 
        sql: 'ALTER TABLE investigaciones ENABLE TRIGGER trigger_log_actividades_investigacion;' 
      });

    if (errorEnable) {
      console.log('⚠️ No se pudo restaurar trigger:', errorEnable);
    } else {
      console.log('✅ Trigger restaurado');
      resultados['trigger_restaurado'] = true;
    }

    const resultadoFinal = {
      investigacionId,
      nombre_investigacion: investigacion.nombre,
      eliminacion: resultados,
      timestamp: new Date().toISOString()
    };

    console.log('🎯 Resultado final de eliminación directa:', resultadoFinal);

    res.status(200).json(resultadoFinal);

  } catch (error) {
    console.error('❌ Error general:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error });
  }
} 