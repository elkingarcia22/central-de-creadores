import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { userId, sesionId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId es requerido' });
    }

    console.log('🔍 Debugging Google Calendar Events...');
    console.log('📊 Parámetros:', { userId, sesionId });

    // Obtener todos los eventos de Google Calendar para el usuario
    const { data: allEvents, error: allEventsError } = await supabaseServer
      .from('google_calendar_events')
      .select('*')
      .eq('user_id', userId);

    if (allEventsError) {
      console.error('❌ Error obteniendo eventos:', allEventsError);
      return res.status(500).json({ error: allEventsError.message });
    }

    console.log('📋 Todos los eventos de Google Calendar:', allEvents);

    // Si se proporciona sesionId, buscar específicamente ese evento
    let specificEvent = null;
    if (sesionId) {
      const { data: specificEventData, error: specificEventError } = await supabaseServer
        .from('google_calendar_events')
        .select('*')
        .eq('user_id', userId)
        .eq('sesion_id', sesionId)
        .single();

      if (specificEventError) {
        console.log('⚠️ No se encontró evento específico:', specificEventError.message);
      } else {
        specificEvent = specificEventData;
        console.log('🎯 Evento específico encontrado:', specificEvent);
      }
    }

    // Obtener información de reclutamientos para comparar
    const { data: reclutamientos, error: reclutamientosError } = await supabaseServer
      .from('reclutamientos')
      .select('id, fecha_sesion, reclutador_id')
      .eq('reclutador_id', userId);

    if (reclutamientosError) {
      console.error('❌ Error obteniendo reclutamientos:', reclutamientosError);
    } else {
      console.log('📅 Reclutamientos del usuario:', reclutamientos);
    }

    return res.status(200).json({
      success: true,
      userId,
      sesionId,
      totalEvents: allEvents?.length || 0,
      allEvents,
      specificEvent,
      reclutamientos: reclutamientos?.length || 0,
      reclutamientosData: reclutamientos
    });

  } catch (error) {
    console.error('❌ Error en debug:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
