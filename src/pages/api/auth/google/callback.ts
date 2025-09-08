import { NextApiRequest, NextApiResponse } from 'next';
import { getTokens } from '../../../../lib/google-calendar';
import { supabase } from '../../../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { code, state } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Código de autorización no proporcionado' });
  }

  try {
    // Intercambiar código por tokens
    const tokens = await getTokens(code as string);
    
    // Obtener información del usuario autenticado
    const { google } = require('googleapis');
    const oauth2 = google.oauth2({ version: 'v2', auth: tokens.access_token });
    const userInfo = await oauth2.userinfo.get();
    
    // Guardar tokens en la base de datos
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userInfo.data.email)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'Usuario no encontrado en la plataforma' });
    }

    // Guardar tokens de Google Calendar
    const { error: tokenError } = await supabase
      .from('google_calendar_tokens')
      .upsert({
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_type: tokens.token_type,
        expiry_date: tokens.expiry_date,
        scope: tokens.scope,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (tokenError) {
      console.error('Error guardando tokens:', tokenError);
      return res.status(500).json({ error: 'Error guardando tokens de Google Calendar' });
    }

    // Redirigir a la página de sesiones con mensaje de éxito
    res.redirect('/sesiones?google_calendar_connected=true');
    
  } catch (error) {
    console.error('Error en callback de Google:', error);
    res.redirect('/sesiones?google_calendar_error=true');
  }
}
