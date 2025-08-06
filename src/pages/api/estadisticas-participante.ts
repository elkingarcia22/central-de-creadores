import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { participante_id } = req.query;

      if (!participante_id) {
        return res.status(400).json({ error: 'participante_id es requerido' });
      }

      console.log('🔍 Obteniendo estadísticas de participante:', participante_id);

      // Obtener total de participaciones (reclutamientos actuales)
      console.log('🔍 Buscando reclutamientos actuales para participante:', participante_id);
      const { data: reclutamientosActuales, error: errorReclutamientos } = await supabase
        .from('reclutamientos')
        .select('id')
        .eq('participantes_id', participante_id);

      console.log('📊 Reclutamientos actuales encontrados:', reclutamientosActuales?.length || 0);

      if (errorReclutamientos) {
        console.error('Error obteniendo reclutamientos actuales:', errorReclutamientos);
        return res.status(500).json({ error: 'Error obteniendo estadísticas' });
      }

      // Obtener participaciones históricas activas (solo las que aún existen)
      console.log('🔍 Buscando participaciones históricas activas...');
      const { data: participacionesHistoricas, error: errorHistoricas } = await supabase
        .from('historial_participacion_participantes')
        .select('id, fecha_participacion, estado_sesion')
        .eq('participante_id', participante_id)
        .eq('estado_sesion', 'completada');

      console.log('📊 Participaciones históricas activas encontradas:', participacionesHistoricas?.length || 0);
      console.log('❌ Error participaciones históricas:', errorHistoricas);

      if (errorHistoricas) {
        console.error('Error obteniendo participaciones históricas:', errorHistoricas);
        // No retornamos error aquí, solo continuamos con los datos de reclutamientos
      }

      // Calcular total de participaciones (solo actuales)
      const totalParticipaciones = reclutamientosActuales?.length || 0;
      console.log('📊 Total participaciones actuales calculado:', totalParticipaciones);
      console.log('📊 - Reclutamientos actuales:', reclutamientosActuales?.length || 0);
      console.log('📊 - Participaciones históricas (no contadas):', participacionesHistoricas?.length || 0);

      // Obtener información de la última sesión con datos de la investigación
      console.log('🔍 Buscando última sesión...');
      const { data: ultimaSesion, error: errorUltima } = await supabase
        .from('reclutamientos')
        .select(`
          id,
          fecha_sesion,
          investigacion_id,
          estado_agendamiento
        `)
        .eq('participantes_id', participante_id)
        .order('fecha_sesion', { ascending: false })
        .limit(1);

      console.log('📊 Datos de última sesión:', ultimaSesion);
      console.log('❌ Error última sesión:', errorUltima);

      if (errorUltima) {
        console.error('Error obteniendo última sesión:', errorUltima);
        return res.status(500).json({ error: 'Error obteniendo estadísticas' });
      }

      // Obtener información de la investigación si hay última sesión
      let investigacionInfo = null;
      if (ultimaSesion && ultimaSesion.length > 0) {
        console.log('🔍 Obteniendo información de la investigación:', ultimaSesion[0].investigacion_id);
        const { data: investigacion, error: errorInvestigacion } = await supabase
          .from('investigaciones')
          .select('id, nombre, descripcion')
          .eq('id', ultimaSesion[0].investigacion_id)
          .single();

        console.log('📊 Datos de investigación:', investigacion);
        console.log('❌ Error investigación:', errorInvestigacion);

        if (!errorInvestigacion && investigacion) {
          investigacionInfo = {
            id: investigacion.id,
            nombre: investigacion.nombre,
            descripcion: investigacion.descripcion
          };
        }
      }

      const estadisticas = {
        total_participaciones: totalParticipaciones,
        participaciones_historicas: participacionesHistoricas?.length || 0,
        ultima_sesion: ultimaSesion && ultimaSesion.length > 0 ? {
          fecha: ultimaSesion[0].fecha_sesion,
          investigacion: investigacionInfo ? investigacionInfo.nombre : 'Investigación ID: ' + ultimaSesion[0].investigacion_id
        } : null,
        ultima_investigacion: investigacionInfo
      };

      console.log('✅ Estadísticas obtenidas:', estadisticas);
      console.log('🔍 ultima_investigacion:', estadisticas.ultima_investigacion);

      res.status(200).json({
        success: true,
        estadisticas
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas de participante:', error);
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