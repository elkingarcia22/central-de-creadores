import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId es requerido' });
    }

    console.log('🔍 Verificando estado de sincronización para usuario:', userId);

    // 1. Verificar eventos de Google Calendar en la base de datos
    const { data: googleEvents, error: googleEventsError } = await supabaseServer
      .from('google_calendar_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (googleEventsError) {
      console.error('❌ Error obteniendo eventos de Google Calendar:', googleEventsError);
      return res.status(500).json({ error: googleEventsError.message });
    }

    // 2. Verificar reclutamientos del usuario
    const { data: reclutamientos, error: reclutamientosError } = await supabaseServer
      .from('reclutamientos')
      .select('id, fecha_sesion, reclutador_id, created_at, updated_at')
      .eq('reclutador_id', userId)
      .order('created_at', { ascending: false });

    if (reclutamientosError) {
      console.error('❌ Error obteniendo reclutamientos:', reclutamientosError);
      return res.status(500).json({ error: reclutamientosError.message });
    }

    // 3. Verificar tokens de Google Calendar
    const { data: tokens, error: tokensError } = await supabaseServer
      .from('google_calendar_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (tokensError) {
      console.log('⚠️ No se encontraron tokens de Google Calendar:', tokensError.message);
    }

    // 4. Análisis de sincronización
    const analysis = {
      totalGoogleEvents: googleEvents?.length || 0,
      totalReclutamientos: reclutamientos?.length || 0,
      hasGoogleTokens: !!tokens,
      googleEvents: googleEvents?.map(event => ({
        id: event.id,
        sesion_id: event.sesion_id,
        google_event_id: event.google_event_id,
        sync_status: event.sync_status,
        created_at: event.created_at,
        last_sync_at: event.last_sync_at
      })) || [],
      reclutamientos: reclutamientos?.map(reclutamiento => ({
        id: reclutamiento.id,
        fecha_sesion: reclutamiento.fecha_sesion,
        created_at: reclutamiento.created_at,
        updated_at: reclutamiento.updated_at,
        hasGoogleEvent: googleEvents?.some(event => event.sesion_id === reclutamiento.id) || false
      })) || []
    };

    // 5. Identificar problemas
    const problems = [];
    
    if (!tokens) {
      problems.push('❌ No hay tokens de Google Calendar - Usuario no está conectado');
    }
    
    if (analysis.totalReclutamientos > 0 && analysis.totalGoogleEvents === 0) {
      problems.push('❌ Hay reclutamientos pero no hay eventos de Google Calendar - Sincronización no funcionó');
    }
    
    const unsyncedReclutamientos = analysis.reclutamientos.filter(r => !r.hasGoogleEvent);
    if (unsyncedReclutamientos.length > 0) {
      problems.push(`❌ ${unsyncedReclutamientos.length} reclutamientos no están sincronizados con Google Calendar`);
    }

    console.log('📊 Análisis de sincronización:', analysis);
    console.log('⚠️ Problemas encontrados:', problems);

    return res.status(200).json({
      success: true,
      userId,
      analysis,
      problems,
      summary: {
        googleCalendarConnected: !!tokens,
        totalReclutamientos: analysis.totalReclutamientos,
        totalGoogleEvents: analysis.totalGoogleEvents,
        unsyncedReclutamientos: unsyncedReclutamientos.length,
        hasProblems: problems.length > 0
      }
    });

  } catch (error) {
    console.error('❌ Error verificando estado de sincronización:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
