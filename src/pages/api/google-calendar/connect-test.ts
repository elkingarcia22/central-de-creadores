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

    // Crear tokens de prueba para Google Calendar
    const testTokens = {
      user_id: userId,
      access_token: 'test_access_token_' + Date.now(),
      refresh_token: 'test_refresh_token_' + Date.now(),
      created_at: new Date().toISOString()
    };

    // Insertar tokens de prueba
    const { data, error } = await supabase
      .from('google_calendar_tokens')
      .insert(testTokens)
      .select()
      .single();

    if (error) {
      console.error('Error insertando tokens de prueba:', error);
      return res.status(500).json({ 
        error: 'Error insertando tokens de prueba',
        details: error.message 
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Tokens de prueba creados exitosamente',
      data: data,
      note: 'Estos son tokens de prueba. Para sincronización real, el usuario debe conectar Google Calendar desde la interfaz.'
    });

  } catch (error) {
    console.error('Error en connect-test:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
