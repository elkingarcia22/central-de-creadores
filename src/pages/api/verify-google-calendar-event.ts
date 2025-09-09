import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { reclutamientoId, userId } = req.query;

  if (!reclutamientoId || !userId) {
    return res.status(400).json({ error: 'reclutamientoId y userId son requeridos' });
  }

  try {
    console.log('🔍 Verificando evento en Google Calendar:', { reclutamientoId, userId });

    // 1. Obtener tokens del usuario
    const { data: tokens, error: tokensError } = await supabaseServer
      .from('google_calendar_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (tokensError || !tokens) {
      console.error('❌ Error obteniendo tokens:', tokensError);
      return res.status(404).json({ error: 'Tokens de Google Calendar no encontrados' });
    }

    // 2. Configurar OAuth2
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });

    // 3. Verificar si el token necesita refresh
    try {
      await oauth2Client.getAccessToken();
    } catch (refreshError) {
      console.log('🔄 Refrescando token...');
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(credentials);
        
        // Actualizar tokens en la base de datos
        await supabaseServer
          .from('google_calendar_tokens')
          .update({
            access_token: credentials.access_token,
            expires_at: credentials.expiry_date ? new Date(credentials.expiry_date).toISOString() : null,
          })
          .eq('user_id', userId);
      } catch (refreshError) {
        console.error('❌ Error refrescando token:', refreshError);
        return res.status(401).json({ error: 'Error refrescando token de acceso' });
      }
    }

    // 4. Obtener el reclutamiento
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

    // 5. Buscar evento en Google Calendar
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Buscar eventos en el rango de fechas del reclutamiento
    const startDate = new Date(reclutamiento.fecha_sesion);
    const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000); // +1 día

    const eventsResponse = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = eventsResponse.data.items || [];
    console.log(`📅 Eventos encontrados en Google Calendar: ${events.length}`);

    // 6. Buscar evento específico por título o descripción
    const matchingEvent = events.find(event => {
      const summary = event.summary || '';
      const description = event.description || '';
      
      // Buscar por ID del reclutamiento en el título o descripción
      return summary.includes(reclutamientoId) || 
             description.includes(reclutamientoId) ||
             summary.includes('Reclutamiento') ||
             summary.includes('Sesión');
    });

    // 7. Verificar en la tabla de eventos de Google Calendar
    const { data: googleEvent, error: googleEventError } = await supabaseServer
      .from('google_calendar_events')
      .select('*')
      .eq('sesion_id', reclutamientoId)
      .eq('user_id', userId)
      .single();

    console.log('📊 Resultado de verificación:', {
      reclutamiento: {
        id: reclutamiento.id,
        fecha_sesion: reclutamiento.fecha_sesion,
        duracion_sesion: reclutamiento.duracion_sesion
      },
      eventosEncontrados: events.length,
      eventoEspecifico: matchingEvent ? {
        id: matchingEvent.id,
        summary: matchingEvent.summary,
        start: matchingEvent.start,
        end: matchingEvent.end
      } : null,
      eventoEnBD: googleEvent ? {
        id: googleEvent.id,
        google_event_id: googleEvent.google_event_id,
        created_at: googleEvent.created_at
      } : null
    });

    return res.status(200).json({
      success: true,
      reclutamiento: {
        id: reclutamiento.id,
        fecha_sesion: reclutamiento.fecha_sesion,
        duracion_sesion: reclutamiento.duracion_sesion
      },
      googleCalendar: {
        totalEvents: events.length,
        matchingEvent: matchingEvent ? {
          id: matchingEvent.id,
          summary: matchingEvent.summary,
          start: matchingEvent.start,
          end: matchingEvent.end,
          description: matchingEvent.description
        } : null,
        allEvents: events.map(event => ({
          id: event.id,
          summary: event.summary,
          start: event.start,
          end: event.end
        }))
      },
      database: {
        googleEvent: googleEvent ? {
          id: googleEvent.id,
          google_event_id: googleEvent.google_event_id,
          created_at: googleEvent.created_at
        } : null
      }
    });

  } catch (error) {
    console.error('❌ Error verificando evento en Google Calendar:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
