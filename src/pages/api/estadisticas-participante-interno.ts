import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { participante_interno_id } = req.query;

    if (!participante_interno_id || typeof participante_interno_id !== 'string') {
      return res.status(400).json({ 
        error: 'ID del participante interno es requerido' 
      });
    }

    console.log('🔍 Obteniendo estadísticas de participante interno:', participante_interno_id);

    // Obtener reclutamientos actuales de participantes internos
    console.log('🔍 Buscando reclutamientos actuales para participante interno:', participante_interno_id);
    const { data: reclutamientosActuales, error: errorReclutamientos } = await supabase
      .from('reclutamientos')
      .select('id')
      .eq('participantes_internos_id', participante_interno_id);

    console.log('📊 Reclutamientos actuales encontrados:', reclutamientosActuales?.length || 0);

    if (errorReclutamientos) {
      console.error('Error obteniendo reclutamientos actuales:', errorReclutamientos);
      return res.status(500).json({ 
        error: 'Error obteniendo reclutamientos actuales' 
      });
    }

    // Obtener total de participaciones completadas del historial (solo para referencia)
    const { data: participacionesHistoricas, error: errorHistoricas } = await supabase
      .from('historial_participacion_participantes_internos')
      .select('id')
      .eq('participante_interno_id', participante_interno_id)
      .eq('estado_sesion', 'completada');

    if (errorHistoricas) {
      console.error('Error obteniendo participaciones históricas:', errorHistoricas);
      // No retornamos error aquí, solo continuamos
    }

    // Calcular total de participaciones (solo actuales)
    const totalParticipaciones = reclutamientosActuales?.length || 0;
    console.log('📊 Total participaciones actuales calculado:', totalParticipaciones);
    console.log('📊 - Reclutamientos actuales:', reclutamientosActuales?.length || 0);
    console.log('📊 - Participaciones históricas (no contadas):', participacionesHistoricas?.length || 0);

    // Obtener información de la última sesión completada con datos de la investigación
    const { data: ultimaSesion, error: errorUltima } = await supabase
      .from('historial_participacion_participantes_internos')
      .select(`
        fecha_participacion,
        investigacion_id,
        reclutamiento_id,
        investigaciones!inner(
          id,
          nombre,
          descripcion
        )
      `)
      .eq('participante_interno_id', participante_interno_id)
      .eq('estado_sesion', 'completada')
      .order('fecha_participacion', { ascending: false })
      .limit(1);

    if (errorUltima) {
      console.error('Error obteniendo última sesión:', errorUltima);
      return res.status(500).json({ 
        error: 'Error obteniendo última sesión' 
      });
    }

    const estadisticas = {
      total_participaciones: totalParticipaciones,
      ultima_sesion: ultimaSesion?.[0]?.fecha_participacion || null,
      ultima_investigacion: ultimaSesion?.[0]?.investigaciones ? {
        id: ultimaSesion[0].investigacion_id,
        nombre: (ultimaSesion[0].investigaciones as any).nombre,
        descripcion: (ultimaSesion[0].investigaciones as any).descripcion
      } : null
    };

    console.log('✅ Estadísticas obtenidas:', estadisticas);

    return res.status(200).json(estadisticas);

  } catch (error) {
    console.error('Error en estadisticas-participante-interno:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
} 