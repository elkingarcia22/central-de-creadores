import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 === DEBUG HORA SESION ===');

    // 1. Verificar estado actual
    console.log('1. Verificando estado actual...');
    const { data: estadoActual, error: errorEstado } = await supabase
      .from('reclutamientos')
      .select('id, fecha_sesion, hora_sesion')
      .not('fecha_sesion', 'is', null)
      .limit(5);

    if (errorEstado) {
      console.error('❌ Error verificando estado:', errorEstado);
      return res.status(500).json({ error: 'Error verificando estado', details: errorEstado });
    }

    console.log('📊 Estado actual:', estadoActual);

    // 2. Actualizar hora_sesion para registros existentes usando SQL directo
    console.log('2. Actualizando hora_sesion...');
    const { data: updateResult, error: errorUpdate } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          UPDATE reclutamientos 
          SET hora_sesion = 
              EXTRACT(HOUR FROM fecha_sesion)::text || ':' || 
              LPAD(EXTRACT(MINUTE FROM fecha_sesion)::text, 2, '0') || ':' ||
              LPAD(EXTRACT(SECOND FROM fecha_sesion)::text, 2, '0')
          WHERE fecha_sesion IS NOT NULL 
          AND hora_sesion IS NULL;
        `
      });

    if (errorUpdate) {
      console.error('❌ Error actualizando:', errorUpdate);
      return res.status(500).json({ error: 'Error actualizando', details: errorUpdate });
    }

    console.log('✅ Resultado actualización:', updateResult);

    // 3. Verificar resultado
    console.log('3. Verificando resultado...');
    const { data: resultadoFinal, error: errorFinal } = await supabase
      .from('reclutamientos')
      .select('id, fecha_sesion, hora_sesion')
      .not('fecha_sesion', 'is', null)
      .limit(5);

    if (errorFinal) {
      console.error('❌ Error verificando resultado:', errorFinal);
      return res.status(500).json({ error: 'Error verificando resultado', details: errorFinal });
    }

    console.log('📊 Resultado final:', resultadoFinal);

    return res.status(200).json({
      estado_actual: estadoActual,
      resultado_actualizacion: updateResult,
      resultado_final: resultadoFinal
    });

  } catch (error) {
    console.error('❌ Error en debug-hora-sesion:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 