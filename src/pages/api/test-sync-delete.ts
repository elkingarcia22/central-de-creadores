import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase-server';
import { autoSyncCalendar } from '../../lib/auto-sync-calendar';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { userId, testAction } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId es requerido' });
    }

    console.log('🧪 Iniciando test de sincronización...');
    console.log('📊 Parámetros:', { userId, testAction });

    if (testAction === 'check_events') {
      // Verificar eventos existentes
      const { data: events, error: eventsError } = await supabaseServer
        .from('google_calendar_events')
        .select('*')
        .eq('user_id', userId);

      if (eventsError) {
        return res.status(500).json({ error: eventsError.message });
      }

      return res.status(200).json({
        success: true,
        action: 'check_events',
        totalEvents: events?.length || 0,
        events
      });
    }

    if (testAction === 'create_test_reclutamiento') {
      // Crear un reclutamiento de prueba
      const testReclutamiento = {
        investigacion_id: 'test-investigacion-id',
        participantes_id: 'test-participante-id',
        reclutador_id: userId,
        fecha_sesion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Mañana
        duracion_sesion: 60,
        estado_agendamiento: 'agendado',
        meet_link: 'https://meet.google.com/test-link'
      };

      const { data: reclutamiento, error: reclutamientoError } = await supabaseServer
        .from('reclutamientos')
        .insert(testReclutamiento)
        .select()
        .single();

      if (reclutamientoError) {
        return res.status(500).json({ error: reclutamientoError.message });
      }

      console.log('✅ Reclutamiento de prueba creado:', reclutamiento.id);

      // Intentar sincronización automática
      const syncResult = await autoSyncCalendar({
        userId,
        reclutamientoId: reclutamiento.id,
        action: 'create'
      });

      return res.status(200).json({
        success: true,
        action: 'create_test_reclutamiento',
        reclutamiento,
        syncResult
      });
    }

    if (testAction === 'delete_test_reclutamiento') {
      const { reclutamientoId } = req.body;

      if (!reclutamientoId) {
        return res.status(400).json({ error: 'reclutamientoId es requerido para eliminar' });
      }

      // Verificar si existe el evento antes de eliminar
      const { data: existingEvent } = await supabaseServer
        .from('google_calendar_events')
        .select('*')
        .eq('user_id', userId)
        .eq('sesion_id', reclutamientoId)
        .single();

      console.log('🔍 Evento encontrado antes de eliminar:', existingEvent);

      // Eliminar el reclutamiento
      const { data: deletedReclutamiento, error: deleteError } = await supabaseServer
        .from('reclutamientos')
        .delete()
        .eq('id', reclutamientoId)
        .select()
        .single();

      if (deleteError) {
        return res.status(500).json({ error: deleteError.message });
      }

      console.log('✅ Reclutamiento eliminado:', deletedReclutamiento.id);

      // Intentar sincronización automática de eliminación
      const syncResult = await autoSyncCalendar({
        userId,
        reclutamientoId,
        action: 'delete'
      });

      return res.status(200).json({
        success: true,
        action: 'delete_test_reclutamiento',
        deletedReclutamiento,
        existingEvent,
        syncResult
      });
    }

    return res.status(400).json({ error: 'testAction no válido' });

  } catch (error) {
    console.error('❌ Error en test:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
