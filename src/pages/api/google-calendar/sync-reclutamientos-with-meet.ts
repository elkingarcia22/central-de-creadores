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

    // Obtener reclutamientos del usuario (sin joins por problemas de relaciones)
    const { data: reclutamientos, error: reclutamientosError } = await supabase
      .from('reclutamientos')
      .select('*')
      .eq('reclutador_id', userId)
      .order('fecha_sesion', { ascending: true });

    if (reclutamientosError) {
      console.error('Error obteniendo reclutamientos:', reclutamientosError);
      return res.status(500).json({ 
        error: 'Error obteniendo reclutamientos',
        details: reclutamientosError.message
      });
    }

    if (!reclutamientos || reclutamientos.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No hay reclutamientos para sincronizar',
        synced: 0,
        errors: 0
      });
    }

    // Obtener datos relacionados por separado
    let investigaciones = [];
    let participantes = [];
    let participantesInternos = [];
    let participantesFriendFamily = [];

    // Obtener investigaciones
    const investigacionIds = reclutamientos.map(r => r.investigacion_id).filter(Boolean);
    if (investigacionIds.length > 0) {
      const { data: investigacionesData, error: investigacionesError } = await supabase
        .from('investigaciones')
        .select('*')
        .in('id', investigacionIds);
      if (!investigacionesError) {
        investigaciones = investigacionesData || [];
      }
    }

    // Obtener participantes
    const participanteIds = reclutamientos.map(r => r.participantes_id).filter(Boolean);
    if (participanteIds.length > 0) {
      const { data: participantesData, error: participantesError } = await supabase
        .from('participantes')
        .select('*')
        .in('id', participanteIds);
      if (!participantesError) {
        participantes = participantesData || [];
      }
    }

    // Obtener participantes internos
    const participanteInternoIds = reclutamientos.map(r => r.participantes_internos_id).filter(Boolean);
    if (participanteInternoIds.length > 0) {
      const { data: participantesInternosData, error: participantesInternosError } = await supabase
        .from('participantes_internos')
        .select('*')
        .in('id', participanteInternoIds);
      if (!participantesInternosError) {
        participantesInternos = participantesInternosData || [];
      }
    }

    // Obtener participantes friend & family
    const participanteFriendFamilyIds = reclutamientos.map(r => r.participantes_friend_family_id).filter(Boolean);
    if (participanteFriendFamilyIds.length > 0) {
      const { data: participantesFriendFamilyData, error: participantesFriendFamilyError } = await supabase
        .from('participantes_friend_family')
        .select('*')
        .in('id', participanteFriendFamilyIds);
      if (!participantesFriendFamilyError) {
        participantesFriendFamily = participantesFriendFamilyData || [];
      }
    }

    // Combinar datos manualmente
    const reclutamientosCompletos = reclutamientos.map(reclutamiento => {
      const investigacion = investigaciones.find(i => i.id === reclutamiento.investigacion_id);
      const participante = participantes.find(p => p.id === reclutamiento.participantes_id);
      const participanteInterno = participantesInternos.find(p => p.id === reclutamiento.participantes_internos_id);
      const participanteFriendFamily = participantesFriendFamily.find(p => p.id === reclutamiento.participantes_friend_family_id);

      return {
        ...reclutamiento,
        investigacion: investigacion || null,
        participante: participante || null,
        participanteInterno: participanteInterno || null,
        participanteFriendFamily: participanteFriendFamily || null
      };
    });

    let syncedCount = 0;
    let errorCount = 0;

    // Sincronizar cada reclutamiento
    for (const reclutamiento of reclutamientosCompletos) {
      try {
        // Verificar si ya existe en Google Calendar
        const { data: existingEvent, error: existingError } = await supabase
          .from('google_calendar_events')
          .select('*')
          .eq('user_id', userId)
          .eq('sesion_id', reclutamiento.id)
          .single();

        if (existingEvent && !existingError) {
          // Actualizar evento existente
          await updateGoogleCalendarEvent(calendar, existingEvent.google_event_id, reclutamiento);
          console.log(`✅ Evento actualizado: ${reclutamiento.id}`);
        } else {
          // Crear nuevo evento
          const googleEvent = await createGoogleCalendarEvent(calendar, reclutamiento);
          
          // Guardar referencia en la base de datos
          await supabase
            .from('google_calendar_events')
            .insert({
              user_id: userId,
              sesion_id: reclutamiento.id,
              google_event_id: googleEvent.id,
              google_calendar_id: 'primary',
              sync_status: 'synced',
              created_at: new Date().toISOString()
            });
          
          console.log(`✅ Evento creado: ${reclutamiento.id}`);
        }
        
        syncedCount++;
      } catch (error) {
        console.error(`❌ Error sincronizando reclutamiento ${reclutamiento.id}:`, error);
        errorCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Sincronización completada: ${syncedCount} sesiones sincronizadas`,
      synced: syncedCount,
      errors: errorCount
    });

  } catch (error) {
    console.error('Error en sincronización:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

async function createGoogleCalendarEvent(calendar: any, reclutamiento: any) {
  // Obtener información del participante
  let participanteInfo = '';
  if (reclutamiento.participante) {
    participanteInfo = reclutamiento.participante.nombre || 'Participante Externo';
  } else if (reclutamiento.participanteInterno) {
    participanteInfo = reclutamiento.participanteInterno.nombre || 'Participante Interno';
  } else if (reclutamiento.participanteFriendFamily) {
    participanteInfo = reclutamiento.participanteFriendFamily.nombre || 'Participante Friend & Family';
  }

  // Crear título del evento
  const titulo = `Reclutamiento - ${reclutamiento.investigacion?.nombre || 'Investigación'}${participanteInfo ? ` - ${participanteInfo}` : ''}`;

  // Crear descripción
  let descripcion = `Sesión de reclutamiento${participanteInfo ? ` con ${participanteInfo}` : ''}`;
  
  // Agregar enlace de Meet si existe
  if (reclutamiento.meet_link) {
    descripcion += `\n\nEnlace de Google Meet: ${reclutamiento.meet_link}`;
  }

  // Combinar fecha y hora
  const fechaSesion = new Date(reclutamiento.fecha_sesion);
  const endDate = new Date(fechaSesion.getTime() + (reclutamiento.duracion_sesion * 60000));

  const event = {
    summary: titulo,
    description: descripcion,
    start: {
      dateTime: fechaSesion.toISOString(),
      timeZone: 'America/Bogota'
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: 'America/Bogota'
    },
    // Agregar enlace de Meet como conferencia si existe
    ...(reclutamiento.meet_link && {
      conferenceData: {
        createRequest: {
          requestId: `meet-${reclutamiento.id}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      }
    })
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
    conferenceDataVersion: reclutamiento.meet_link ? 1 : 0
  });

  return response.data;
}

async function updateGoogleCalendarEvent(calendar: any, googleEventId: string, reclutamiento: any) {
  // Obtener información del participante
  let participanteInfo = '';
  if (reclutamiento.participante) {
    participanteInfo = reclutamiento.participante.nombre || 'Participante Externo';
  } else if (reclutamiento.participanteInterno) {
    participanteInfo = reclutamiento.participanteInterno.nombre || 'Participante Interno';
  } else if (reclutamiento.participanteFriendFamily) {
    participanteInfo = reclutamiento.participanteFriendFamily.nombre || 'Participante Friend & Family';
  }

  // Crear título del evento
  const titulo = `Reclutamiento - ${reclutamiento.investigacion?.nombre || 'Investigación'}${participanteInfo ? ` - ${participanteInfo}` : ''}`;

  // Crear descripción
  let descripcion = `Sesión de reclutamiento${participanteInfo ? ` con ${participanteInfo}` : ''}`;
  
  // Agregar enlace de Meet si existe
  if (reclutamiento.meet_link) {
    descripcion += `\n\nEnlace de Google Meet: ${reclutamiento.meet_link}`;
  }

  // Combinar fecha y hora
  const fechaSesion = new Date(reclutamiento.fecha_sesion);
  const endDate = new Date(fechaSesion.getTime() + (reclutamiento.duracion_sesion * 60000));

  const event = {
    summary: titulo,
    description: descripcion,
    start: {
      dateTime: fechaSesion.toISOString(),
      timeZone: 'America/Bogota'
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: 'America/Bogota'
    }
  };

  const response = await calendar.events.update({
    calendarId: 'primary',
    eventId: googleEventId,
    resource: event
  });

  return response.data;
}
