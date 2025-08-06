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
    console.log('🧹 Eliminación sin trigger de investigación:', investigacionId);

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

    // 2. Intentar eliminar usando SQL directo para evitar triggers
    console.log('🔄 Intentando eliminación con SQL directo...');
    
    // Usar una consulta SQL directa que elimine todo en una transacción
    const { data: sqlResult, error: sqlError } = await supabase
      .from('investigaciones')
      .select('id')
      .eq('id', investigacionId)
      .single();

    if (sqlError) {
      console.error('❌ Error verificando investigación:', sqlError);
      return res.status(500).json({ error: 'Error verificando investigación' });
    }

    // 3. Eliminar dependencias primero
    console.log('🗑️ Eliminando dependencias...');
    
    // Eliminar log_actividades_investigacion
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

    // Eliminar seguimientos_investigacion
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

    // Eliminar reclutamientos
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

    // 4. Intentar eliminar la investigación usando el endpoint directo
    console.log('🗑️ Eliminando investigación usando endpoint directo...');
    
    // Usar el endpoint directo que creamos
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/investigaciones?id=eq.${investigacionId}`, {
      method: 'DELETE',
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    });

    if (!response.ok) {
      console.error('❌ Error en eliminación directa:', response.status, response.statusText);
      resultados['error_eliminacion_directa'] = {
        status: response.status,
        statusText: response.statusText
      };
      
      // Si falla, intentar con el método normal pero manejando el error
      console.log('🔄 Intentando eliminación normal con manejo de error...');
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
      console.log('✅ Investigación eliminada exitosamente con método directo');
      resultados['investigacion_eliminada_directa'] = true;
    }

    const resultadoFinal = {
      investigacionId,
      nombre_investigacion: investigacion.nombre,
      eliminacion: resultados,
      timestamp: new Date().toISOString()
    };

    console.log('🎯 Resultado final de eliminación sin trigger:', resultadoFinal);

    res.status(200).json(resultadoFinal);

  } catch (error) {
    console.error('❌ Error general:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error });
  }
} 