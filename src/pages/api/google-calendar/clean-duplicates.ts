import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'ID de usuario requerido' });
  }

  try {
    // Obtener tokens del usuario
    const { data: tokens, error: tokensError } = await supabase
      .from('google_calendar_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (tokensError || !tokens) {
      return res.status(400).json({ error: 'Usuario no tiene Google Calendar conectado' });
    }

    // Configurar cliente OAuth2
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });

    // Crear cliente de Google Calendar
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Obtener todos los eventos del usuario en Google Calendar
    const eventsResponse = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 1000,
      singleEvents: true,
      orderBy: 'startTime'
    });

    const events = eventsResponse.data.items || [];
    
    // Filtrar eventos de reclutamiento
    const reclutamientoEvents = events.filter(event => 
      event.summary?.includes('Reclutamiento') && 
      event.extendedProperties?.private?.reclutamiento_id
    );

    console.log(`📊 Encontrados ${reclutamientoEvents.length} eventos de reclutamiento`);

    // Agrupar eventos por reclutamiento_id
    const eventsByReclutamiento = {};
    reclutamientoEvents.forEach(event => {
      const reclutamientoId = event.extendedProperties?.private?.reclutamiento_id;
      if (reclutamientoId) {
        if (!eventsByReclutamiento[reclutamientoId]) {
          eventsByReclutamiento[reclutamientoId] = [];
        }
        eventsByReclutamiento[reclutamientoId].push(event);
      }
    });

    let deletedCount = 0;
    let keptCount = 0;

    // Eliminar duplicados (mantener solo el más reciente)
    for (const [reclutamientoId, events] of Object.entries(eventsByReclutamiento)) {
      if (events.length > 1) {
        // Ordenar por fecha de creación (más reciente primero)
        events.sort((a, b) => {
          const dateA = new Date(a.created || a.updated || 0);
          const dateB = new Date(b.created || b.updated || 0);
          return dateB.getTime() - dateA.getTime();
        });

        // Mantener el primero (más reciente) y eliminar el resto
        const toKeep = events[0];
        const toDelete = events.slice(1);

        for (const event of toDelete) {
          try {
            await calendar.events.delete({
              calendarId: 'primary',
              eventId: event.id
            });
            deletedCount++;
            console.log(`🗑️ Eliminado evento duplicado: ${event.id}`);
          } catch (error) {
            console.error(`❌ Error eliminando evento ${event.id}:`, error);
          }
        }

        keptCount++;
        console.log(`✅ Mantenido evento: ${toKeep.id} para reclutamiento ${reclutamientoId}`);
      } else {
        keptCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Limpieza completada: ${deletedCount} eventos duplicados eliminados, ${keptCount} eventos mantenidos`,
      deleted: deletedCount,
      kept: keptCount
    });

  } catch (error) {
    console.error('Error en limpieza de duplicados:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
