import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer as supabase } from '../../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'ID de usuario requerido' });
  }

  try {
    // Verificar si el usuario tiene Google Calendar conectado
    const { data: tokens, error: tokenError } = await supabase
      .from('google_calendar_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (tokenError || !tokens) {
      return res.status(200).json({
        connected: false,
        message: 'Google Calendar no conectado'
      });
    }

    // Verificar si los tokens están expirados
    const isExpired = tokens.expiry_date && new Date(tokens.expiry_date) < new Date();
    
    if (isExpired && !tokens.refresh_token) {
      return res.status(200).json({
        connected: false,
        message: 'Tokens de Google Calendar expirados'
      });
    }

    return res.status(200).json({
      connected: true,
      connected_at: tokens.created_at,
      last_sync: tokens.updated_at,
      has_refresh_token: !!tokens.refresh_token,
      message: 'Google Calendar conectado'
    });

  } catch (error) {
    console.error('Error verificando estado:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
