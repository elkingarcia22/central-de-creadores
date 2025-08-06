import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { participante_friend_family_id } = req.query;

      if (!participante_friend_family_id) {
        return res.status(400).json({ error: 'participante_friend_family_id es requerido' });
      }

      console.log('🔍 Obteniendo estadísticas de participante Friend and Family:', participante_friend_family_id);

      // Obtener reclutamientos actuales de participantes friend & family
      console.log('🔍 Buscando reclutamientos actuales para participante friend & family:', participante_friend_family_id);
      const { data: reclutamientosActuales, error: errorReclutamientos } = await supabase
        .from('reclutamientos')
        .select('id')
        .eq('participantes_friend_family_id', participante_friend_family_id);

      console.log('📊 Reclutamientos actuales encontrados:', reclutamientosActuales?.length || 0);

      if (errorReclutamientos) {
        console.error('Error obteniendo reclutamientos actuales:', errorReclutamientos);
        return res.status(500).json({ 
          error: 'Error obteniendo reclutamientos actuales' 
        });
      }

      // Obtener total de participaciones del historial (solo para referencia)
      const { data: participacionesHistoricas, error: errorHistoricas } = await supabase
        .from('historial_participacion_participantes_friend_family')
        .select('id')
        .eq('participante_friend_family_id', participante_friend_family_id)
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
        .from('historial_participacion_participantes_friend_family')
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
        .eq('participante_friend_family_id', participante_friend_family_id)
        .eq('estado_sesion', 'completada')
        .order('fecha_participacion', { ascending: false })
        .limit(1);

      if (errorUltima) {
        console.error('Error obteniendo última sesión:', errorUltima);
        return res.status(500).json({ error: 'Error obteniendo estadísticas' });
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

      res.status(200).json({
        success: true,
        estadisticas
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas de participante Friend and Family:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
} 