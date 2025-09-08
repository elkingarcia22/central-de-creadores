import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer as supabase } from '../../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'ID de usuario requerido' });
    }

    console.log('🔌 Desconectando Google Calendar para usuario:', userId);

    // Eliminar tokens de Google Calendar
    const { data: deletedTokens, error: deleteError } = await supabase
      .from('google_calendar_tokens')
      .delete()
      .eq('user_id', userId)
      .select();

    if (deleteError) {
      console.error('❌ Error eliminando tokens:', deleteError);
      return res.status(500).json({ 
        error: 'Error eliminando tokens',
        details: deleteError.message 
      });
    }

    // Eliminar referencias de eventos de Google Calendar (si es posible)
    try {
      const { data: deletedEvents, error: eventsError } = await supabase
        .from('google_calendar_events')
        .delete()
        .eq('user_id', userId)
        .select();

      if (eventsError) {
        console.log('⚠️ No se pudieron eliminar referencias de eventos (problema de foreign key):', eventsError.message);
      } else {
        console.log('✅ Referencias de eventos eliminadas:', deletedEvents?.length || 0);
      }
    } catch (eventsError) {
      console.log('⚠️ Error eliminando referencias de eventos:', eventsError);
    }

    console.log('✅ Google Calendar desconectado exitosamente');

    return res.status(200).json({
      success: true,
      message: 'Google Calendar desconectado exitosamente',
      user_id: userId,
      tokens_deleted: deletedTokens?.length || 0,
      events_deleted: 'N/A (problema de foreign key)'
    });

  } catch (error) {
    console.error('❌ Error desconectando Google Calendar:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}