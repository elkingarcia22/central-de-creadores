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

    // Obtener reclutamientos del usuario (como reclutador, responsable o implementador)
    console.log('🔍 Buscando reclutamientos para usuario:', userId);
    
    // Buscar reclutamientos donde el usuario sea reclutador, responsable o implementador
    console.log('🔍 Buscando reclutamientos como reclutador...');
    const { data: reclutamientosComoReclutador, error: errorReclutador } = await supabase
      .from('reclutamientos')
      .select('*')
      .eq('reclutador_id', userId)
      .order('fecha_sesion', { ascending: true });

    console.log('🔍 Buscando reclutamientos como responsable...');
    const { data: reclutamientosComoResponsable, error: errorResponsable } = await supabase
      .from('reclutamientos')
      .select(`
        *,
        investigaciones!inner(
          responsable_id
        )
      `)
      .eq('investigaciones.responsable_id', userId)
      .order('fecha_sesion', { ascending: true });

    console.log('🔍 Buscando reclutamientos como implementador...');
    const { data: reclutamientosComoImplementador, error: errorImplementador } = await supabase
      .from('reclutamientos')
      .select(`
        *,
        investigaciones!inner(
          implementador_id
        )
      `)
      .eq('investigaciones.implementador_id', userId)
      .order('fecha_sesion', { ascending: true });

    // Combinar todos los reclutamientos y eliminar duplicados
    const allReclutamientos = [
      ...(reclutamientosComoReclutador || []),
      ...(reclutamientosComoResponsable || []),
      ...(reclutamientosComoImplementador || [])
    ];

    // Eliminar duplicados por ID
    let reclutamientos = allReclutamientos.filter((reclutamiento, index, self) => 
      index === self.findIndex(r => r.id === reclutamiento.id)
    );

    const reclutamientosError = errorReclutador || errorResponsable || errorImplementador;

    console.log('📊 Resultado de reclutamientos:', {
      count: reclutamientos?.length || 0,
      error: reclutamientosError,
      userId: userId,
      comoReclutador: reclutamientosComoReclutador?.length || 0,
      comoResponsable: reclutamientosComoResponsable?.length || 0,
      comoImplementador: reclutamientosComoImplementador?.length || 0,
      reclutamientos: reclutamientos?.map(r => ({
        id: r.id,
        fecha_sesion: r.fecha_sesion,
        reclutador_id: r.reclutador_id,
        investigacion_responsable: r.investigaciones?.responsable_id,
        investigacion_implementador: r.investigaciones?.implementador_id
      }))
    });

    if (reclutamientosError) {
      console.error('Error obteniendo reclutamientos:', reclutamientosError);
      return res.status(500).json({ 
        error: 'Error obteniendo reclutamientos',
        details: reclutamientosError.message
      });
    }

    if (!reclutamientos || reclutamientos.length === 0) {
      console.log('⚠️ No se encontraron reclutamientos con reclutador_id, intentando obtener todos...');
      
      // Intentar obtener todos los reclutamientos como fallback
      const { data: allReclutamientos, error: allReclutamientosError } = await supabase
        .from('reclutamientos')
        .select('*')
        .order('fecha_sesion', { ascending: true })
        .limit(10); // Limitar a 10 para prueba

      console.log('📊 Resultado de todos los reclutamientos:', {
        count: allReclutamientos?.length || 0,
        error: allReclutamientosError
      });

      if (!allReclutamientos || allReclutamientos.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No hay reclutamientos para sincronizar',
          synced: 0,
          errors: 0,
          debug: {
            userId,
            reclutadorFilter: 'No se encontraron reclutamientos con reclutador_id',
            allReclutamientos: 'No se encontraron reclutamientos en la tabla'
          }
        });
      }

      // Usar todos los reclutamientos como fallback
      reclutamientos = allReclutamientos;
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

    console.log('🚀 Iniciando sincronización de', reclutamientosCompletos.length, 'reclutamientos');

    // Sincronizar cada reclutamiento
    for (const reclutamiento of reclutamientosCompletos) {
      console.log('🔄 Procesando reclutamiento:', reclutamiento.id, 'fecha:', reclutamiento.fecha_sesion);
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
    location: 'Oficina Principal',
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 día antes
        { method: 'popup', minutes: 30 } // 30 minutos antes
      ]
    },
    extendedProperties: {
      private: {
        reclutamiento_id: reclutamiento.id,
        investigacion_id: reclutamiento.investigacion_id,
        participante_id: reclutamiento.participantes_id || reclutamiento.participantes_internos_id || reclutamiento.participantes_friend_family_id,
        meet_link: reclutamiento.meet_link || ''
      }
    }
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: event
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
    },
    location: 'Oficina Principal',
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 día antes
        { method: 'popup', minutes: 30 } // 30 minutos antes
      ]
    },
    extendedProperties: {
      private: {
        reclutamiento_id: reclutamiento.id,
        investigacion_id: reclutamiento.investigacion_id,
        participante_id: reclutamiento.participantes_id || reclutamiento.participantes_internos_id || reclutamiento.participantes_friend_family_id,
        meet_link: reclutamiento.meet_link || ''
      }
    }
  };

  const response = await calendar.events.update({
    calendarId: 'primary',
    eventId: googleEventId,
    resource: event
  });

  return response.data;
}
