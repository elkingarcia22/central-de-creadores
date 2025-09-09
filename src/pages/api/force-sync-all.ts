import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase-server';
import { autoSyncCalendar } from '../../lib/auto-sync-calendar';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId es requerido' });
    }

    console.log('🔄 Forzando sincronización de todos los reclutamientos para usuario:', userId);

    // 1. Verificar que el usuario tenga Google Calendar conectado
    const { data: tokens, error: tokensError } = await supabaseServer
      .from('google_calendar_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (tokensError || !tokens) {
      return res.status(400).json({ 
        error: 'Usuario no tiene Google Calendar conectado',
        details: 'Primero debe conectar Google Calendar en la página de conexiones'
      });
    }

    // 2. Obtener todos los reclutamientos del usuario
    const { data: reclutamientos, error: reclutamientosError } = await supabaseServer
      .from('reclutamientos')
      .select('id, fecha_sesion, reclutador_id, updated_at')
      .eq('reclutador_id', userId)
      .order('updated_at', { ascending: false });

    if (reclutamientosError) {
      console.error('❌ Error obteniendo reclutamientos:', reclutamientosError);
      return res.status(500).json({ error: reclutamientosError.message });
    }

    if (!reclutamientos || reclutamientos.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No hay reclutamientos para sincronizar',
        synced: 0,
        errors: 0
      });
    }

    console.log(`📋 Encontrados ${reclutamientos.length} reclutamientos para sincronizar`);

    // 3. Sincronizar cada reclutamiento
    let syncedCount = 0;
    let errorCount = 0;
    const results = [];

    for (const reclutamiento of reclutamientos) {
      try {
        console.log(`🔄 Sincronizando reclutamiento: ${reclutamiento.id}`);
        
        const syncResult = await autoSyncCalendar({
          userId,
          reclutamientoId: reclutamiento.id,
          action: 'create' // Usar 'create' para forzar sincronización
        });

        if (syncResult.success) {
          syncedCount++;
          results.push({
            reclutamientoId: reclutamiento.id,
            fecha_sesion: reclutamiento.fecha_sesion,
            status: 'success',
            message: 'Sincronizado exitosamente'
          });
          console.log(`✅ Reclutamiento ${reclutamiento.id} sincronizado exitosamente`);
        } else {
          errorCount++;
          results.push({
            reclutamientoId: reclutamiento.id,
            fecha_sesion: reclutamiento.fecha_sesion,
            status: 'error',
            message: syncResult.reason || 'Error desconocido'
          });
          console.log(`❌ Error sincronizando reclutamiento ${reclutamiento.id}:`, syncResult.reason);
        }
      } catch (error) {
        errorCount++;
        results.push({
          reclutamientoId: reclutamiento.id,
          fecha_sesion: reclutamiento.fecha_sesion,
          status: 'error',
          message: error instanceof Error ? error.message : 'Error desconocido'
        });
        console.error(`❌ Error sincronizando reclutamiento ${reclutamiento.id}:`, error);
      }
    }

    console.log(`✅ Sincronización completada: ${syncedCount} exitosos, ${errorCount} errores`);

    return res.status(200).json({
      success: true,
      message: `Sincronización completada: ${syncedCount} reclutamientos sincronizados, ${errorCount} errores`,
      total: reclutamientos.length,
      synced: syncedCount,
      errors: errorCount,
      results
    });

  } catch (error) {
    console.error('❌ Error en sincronización forzada:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
