import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { autoSyncCalendar } from '../../lib/auto-sync-calendar';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { reclutamientoId, userId } = req.body;

  if (!reclutamientoId || !userId) {
    return res.status(400).json({ error: 'reclutamientoId y userId son requeridos' });
  }

  try {
    console.log('🔄 Sincronizando reclutamiento específico:', { reclutamientoId, userId });

    // 1. Obtener el reclutamiento
    const { data: reclutamiento, error: reclutamientoError } = await supabaseServer
      .from('reclutamientos')
      .select('*')
      .eq('id', reclutamientoId)
      .eq('reclutador_id', userId)
      .single();

    if (reclutamientoError || !reclutamiento) {
      console.error('❌ Error obteniendo reclutamiento:', reclutamientoError);
      return res.status(404).json({ error: 'Reclutamiento no encontrado' });
    }

    console.log('📋 Reclutamiento encontrado:', {
      id: reclutamiento.id,
      fecha_sesion: reclutamiento.fecha_sesion,
      reclutador_id: reclutamiento.reclutador_id
    });

    // 2. Sincronizar con Google Calendar
    const syncResult = await autoSyncCalendar({
      reclutamientoId: reclutamiento.id,
      fechaSesion: reclutamiento.fecha_sesion,
      userId: reclutamiento.reclutador_id,
      action: 'create'
    });

    console.log('✅ Resultado de sincronización:', syncResult);

    return res.status(200).json({
      success: true,
      message: 'Reclutamiento sincronizado exitosamente',
      reclutamiento: {
        id: reclutamiento.id,
        fecha_sesion: reclutamiento.fecha_sesion
      },
      syncResult
    });

  } catch (error) {
    console.error('❌ Error sincronizando reclutamiento:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
