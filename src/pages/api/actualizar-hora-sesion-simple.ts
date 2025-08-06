import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 === ACTUALIZAR HORA SESION SIMPLE ===');

    // 1. Obtener todos los reclutamientos que necesitan actualización
    console.log('1. Obteniendo reclutamientos a actualizar...');
    const { data: reclutamientos, error: errorQuery } = await supabase
      .from('reclutamientos')
      .select('id, fecha_sesion, hora_sesion')
      .not('fecha_sesion', 'is', null)
      .is('hora_sesion', null);

    if (errorQuery) {
      console.error('❌ Error obteniendo reclutamientos:', errorQuery);
      return res.status(500).json({ error: 'Error obteniendo reclutamientos', details: errorQuery });
    }

    console.log(`📊 Encontrados ${reclutamientos?.length || 0} reclutamientos para actualizar`);

    // 2. Actualizar cada registro
    let registrosActualizados = 0;
    
    if (reclutamientos && reclutamientos.length > 0) {
      for (const reclutamiento of reclutamientos) {
        if (reclutamiento.fecha_sesion) {
          // Convertir la fecha a hora usando JavaScript
          const fecha = new Date(reclutamiento.fecha_sesion);
          const hora = fecha.getHours().toString().padStart(2, '0');
          const minutos = fecha.getMinutes().toString().padStart(2, '0');
          const segundos = fecha.getSeconds().toString().padStart(2, '0');
          const horaFormateada = `${hora}:${minutos}:${segundos}`;

          console.log(`🔄 Actualizando ${reclutamiento.id}: ${horaFormateada}`);

          const { error: errorUpdate } = await supabase
            .from('reclutamientos')
            .update({ hora_sesion: horaFormateada })
            .eq('id', reclutamiento.id);

          if (errorUpdate) {
            console.error(`❌ Error actualizando ${reclutamiento.id}:`, errorUpdate);
          } else {
            registrosActualizados++;
            console.log(`✅ Actualizado ${reclutamiento.id}`);
          }
        }
      }
    }

    console.log(`✅ Total registros actualizados: ${registrosActualizados}`);

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
      reclutamientos_encontrados: reclutamientos?.length || 0,
      registros_actualizados: registrosActualizados,
      resultado_final: resultadoFinal
    });

  } catch (error) {
    console.error('❌ Error en actualizar-hora-sesion-simple:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 