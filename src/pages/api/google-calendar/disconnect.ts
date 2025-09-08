import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'ID de usuario requerido' });
  }

  try {
    // Eliminar tokens de Google Calendar
    const { error: deleteError } = await supabase
      .from('google_calendar_tokens')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error eliminando tokens:', deleteError);
      return res.status(500).json({ error: 'Error desconectando Google Calendar' });
    }

    // Opcional: Limpiar referencias de Google Calendar en sesiones
    const { error: updateError } = await supabase
      .from('sesiones')
      .update({
        google_calendar_id: null,
        google_event_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('moderador_id', userId); // Asumiendo que el moderador es el usuario

    if (updateError) {
      console.error('Error limpiando referencias:', updateError);
      // No fallar la desconexión por esto
    }

    return res.status(200).json({
      success: true,
      message: 'Google Calendar desconectado exitosamente'
    });

  } catch (error) {
    console.error('Error desconectando Google Calendar:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
