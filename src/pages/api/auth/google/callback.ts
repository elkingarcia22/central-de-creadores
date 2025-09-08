import { NextApiRequest, NextApiResponse } from 'next';
import { getTokens } from '../../../../lib/google-calendar';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { code, state, error } = req.query;

  // Verificar si hay error en la autorización
  if (error) {
    console.error('Error en autorización de Google:', error);
    return res.redirect('/configuraciones/conexiones?error=authorization_denied');
  }

  // Verificar que tenemos el código de autorización
  if (!code) {
    console.error('No se recibió código de autorización');
    return res.redirect('/configuraciones/conexiones?error=no_code');
  }

  try {
    // Intercambiar código por tokens
    const tokens = await getTokens(code as string);
    
    // Obtener información del usuario desde el state (si se proporciona)
    const userId = state as string;
    
    if (!userId) {
      console.error('No se proporcionó userId en el state');
      return res.redirect('/configuraciones/conexiones?error=no_user_id');
    }

    // Almacenar tokens en la base de datos
    const { error: dbError } = await supabase
      .from('google_calendar_tokens')
      .upsert({
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_type: tokens.token_type || 'Bearer',
        expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
        scope: tokens.scope,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (dbError) {
      console.error('Error almacenando tokens:', dbError);
      return res.redirect('/configuraciones/conexiones?error=database_error');
    }

    // Redirigir de vuelta a la página de conexiones con éxito
    return res.redirect('/configuraciones/conexiones?success=google_calendar_connected');

  } catch (error) {
    console.error('Error en callback de Google OAuth:', error);
    return res.redirect('/configuraciones/conexiones?error=callback_error');
  }
}