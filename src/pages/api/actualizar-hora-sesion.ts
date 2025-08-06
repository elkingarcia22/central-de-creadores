import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 === ACTUALIZAR HORA SESION ===');

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

    // 2. Actualizar registros usando SQL directo con to_char
    console.log('2. Actualizando registros...');
    let registrosActualizados = 0;
    
    for (const reclutamiento of estadoActual || []) {
      if (reclutamiento.fecha_sesion && !reclutamiento.hora_sesion) {
        // Usar to_char para formatear la hora correctamente
        const { data: updateData, error: errorUpdate } = await supabase
          .rpc('actualizar_hora_sesion_simple', {
            reclutamiento_id: reclutamiento.id
          });

        if (errorUpdate) {
          console.error(`❌ Error actualizando ${reclutamiento.id}:`, errorUpdate);
        } else {
          registrosActualizados++;
          console.log(`✅ Actualizado ${reclutamiento.id}`);
        }
      }
    }

    console.log(`✅ Registros actualizados: ${registrosActualizados}`);

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
      registros_actualizados: registrosActualizados,
      resultado_final: resultadoFinal
    });

  } catch (error) {
    console.error('❌ Error en actualizar-hora-sesion:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 