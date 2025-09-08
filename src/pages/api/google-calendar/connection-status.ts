import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { supabaseServer as supabase } from '../../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'ID de usuario requerido' });
    }

    console.log('🔍 Verificando estado de conexión para usuario:', userId);

    // Obtener tokens del usuario
    const { data: tokens, error: tokensError } = await supabase
      .from('google_calendar_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (tokensError || !tokens) {
      return res.status(200).json({
        connected: false,
        message: 'Google Calendar no conectado',
        reason: 'No tokens found'
      });
    }

    // Verificar si son tokens de prueba
    if (tokens.access_token?.startsWith('test_access_token_')) {
      return res.status(200).json({
        connected: false,
        message: 'Tokens de prueba detectados',
        reason: 'Test tokens',
        needs_real_connection: true
      });
    }

    // Configurar OAuth2 y probar la conexión
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });

    try {
      // Probar la conexión obteniendo la lista de calendarios
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      const calendarList = await calendar.calendarList.list({
        maxResults: 1
      });

      console.log('✅ Conexión verificada exitosamente');

      return res.status(200).json({
        connected: true,
        message: 'Google Calendar conectado y funcionando',
        connected_at: tokens.created_at,
        last_sync: tokens.updated_at,
        has_refresh_token: !!tokens.refresh_token,
        calendar_count: calendarList.data.items?.length || 0
      });

    } catch (connectionError: any) {
      console.error('❌ Error verificando conexión:', connectionError);

      // Si el error es de token expirado, intentar refrescar
      if (connectionError.code === 401 || connectionError.message?.includes('invalid_grant')) {
        console.log('🔄 Token expirado, intentando refrescar...');
        
        try {
          const { credentials } = await oauth2Client.refreshAccessToken();
          
          // Actualizar tokens en la base de datos
          const updatedTokens = {
            access_token: credentials.access_token,
            refresh_token: credentials.refresh_token || tokens.refresh_token,
            expires_at: credentials.expiry_date ? new Date(credentials.expiry_date).toISOString() : null,
            updated_at: new Date().toISOString()
          };

          await supabase
            .from('google_calendar_tokens')
            .update(updatedTokens)
            .eq('user_id', userId);

          console.log('✅ Tokens refrescados exitosamente');

          return res.status(200).json({
            connected: true,
            message: 'Google Calendar reconectado exitosamente',
            connected_at: tokens.created_at,
            last_sync: new Date().toISOString(),
            has_refresh_token: !!updatedTokens.refresh_token,
            tokens_refreshed: true
          });

        } catch (refreshError) {
          console.error('❌ Error refrescando tokens:', refreshError);
          
          return res.status(200).json({
            connected: false,
            message: 'Conexión perdida - tokens no válidos',
            reason: 'Token refresh failed',
            needs_reconnection: true,
            error: refreshError instanceof Error ? refreshError.message : 'Error desconocido'
          });
        }
      }

      return res.status(200).json({
        connected: false,
        message: 'Error de conexión con Google Calendar',
        reason: 'Connection test failed',
        needs_reconnection: true,
        error: connectionError.message || 'Error desconocido'
      });
    }

  } catch (error) {
    console.error('❌ Error verificando estado de conexión:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
