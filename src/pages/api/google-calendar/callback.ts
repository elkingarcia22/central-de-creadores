import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { supabaseServer as supabase } from '../../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { code, state: userId } = req.query;

    if (!code || !userId) {
      return res.status(400).json({ error: 'Código de autorización y userId requeridos' });
    }

    console.log('🔄 Procesando callback de Google Calendar para usuario:', userId);

    // Configurar OAuth2
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI // Usar el redirect URI configurado en .env
    );

    // Intercambiar código por tokens
    const { tokens } = await oauth2Client.getToken(code as string);
    console.log('✅ Tokens obtenidos exitosamente');

    // Guardar tokens en la base de datos
    const tokenData = {
      user_id: userId as string,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_type: tokens.token_type || 'Bearer',
      expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
      scope: tokens.scope,
      created_at: new Date().toISOString()
    };

    // Eliminar tokens existentes del usuario
    await supabase
      .from('google_calendar_tokens')
      .delete()
      .eq('user_id', userId);

    // Insertar nuevos tokens
    const { data, error } = await supabase
      .from('google_calendar_tokens')
      .insert(tokenData)
      .select()
      .single();

    if (error) {
      console.error('❌ Error guardando tokens:', error);
      return res.status(500).json({ 
        error: 'Error guardando tokens',
        details: error.message 
      });
    }

    console.log('✅ Tokens guardados exitosamente');

    // Probar la conexión creando un evento de prueba
    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    try {
      const testEvent = {
        summary: 'Test de Conexión - Central de Creadores',
        description: 'Este es un evento de prueba para verificar la conexión con Google Calendar.',
        start: {
          dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Mañana
          timeZone: 'America/Bogota',
        },
        end: {
          dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // Mañana + 1 hora
          timeZone: 'America/Bogota',
        },
      };

      const createdEvent = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: testEvent,
      });

      console.log('✅ Evento de prueba creado:', createdEvent.data.id);

      // Eliminar el evento de prueba
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: createdEvent.data.id,
      });

      console.log('✅ Evento de prueba eliminado');

      // Redirigir a la página de conexiones con parámetros de éxito
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/configuraciones/conexiones?google_calendar_connected=true&user_id=${userId}`;
      return res.redirect(302, redirectUrl);

    } catch (testError) {
      console.error('❌ Error en evento de prueba:', testError);
      // Redirigir a la página de conexiones con parámetros de éxito (aunque falló el evento de prueba)
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/configuraciones/conexiones?google_calendar_connected=true&user_id=${userId}`;
      return res.redirect(302, redirectUrl);
    }

  } catch (error) {
    console.error('❌ Error en callback de Google Calendar:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
