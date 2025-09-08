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
    console.log('🔍 Iniciando diagnóstico de sincronización para usuario:', userId);

    // 1. Verificar si el usuario tiene tokens de Google Calendar
    const { data: tokens, error: tokensError } = await supabase
      .from('google_calendar_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (tokensError || !tokens) {
      console.error('❌ Error obteniendo tokens:', tokensError);
      return res.status(400).json({ 
        error: 'Usuario no tiene Google Calendar conectado',
        details: tokensError?.message || 'No se encontraron tokens'
      });
    }

    console.log('✅ Tokens encontrados para el usuario');

    // 2. Verificar configuración de Google OAuth
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
      console.error('❌ Variables de entorno de Google no configuradas');
      return res.status(500).json({ 
        error: 'Variables de entorno de Google no configuradas',
        details: {
          GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
          GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
          GOOGLE_REDIRECT_URI: !!process.env.GOOGLE_REDIRECT_URI
        }
      });
    }

    console.log('✅ Variables de entorno de Google configuradas');

    // 3. Configurar cliente OAuth2
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });

    console.log('✅ Cliente OAuth2 configurado');

    // 4. Crear cliente de Google Calendar
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // 5. Probar acceso a Google Calendar
    try {
      const calendarList = await calendar.calendarList.list();
      console.log('✅ Acceso a Google Calendar exitoso');
    } catch (calendarError) {
      console.error('❌ Error accediendo a Google Calendar:', calendarError);
      return res.status(500).json({ 
        error: 'Error accediendo a Google Calendar',
        details: calendarError instanceof Error ? calendarError.message : 'Error desconocido'
      });
    }

    // 6. Obtener reclutamientos del usuario
    const { data: reclutamientos, error: reclutamientosError } = await supabase
      .from('reclutamientos')
      .select('*')
      .eq('reclutador_id', userId)
      .limit(3);

    if (reclutamientosError) {
      console.error('❌ Error obteniendo reclutamientos:', reclutamientosError);
      return res.status(500).json({ 
        error: 'Error obteniendo reclutamientos',
        details: reclutamientosError.message
      });
    }

    if (!reclutamientos || reclutamientos.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Usuario no tiene reclutamientos para sincronizar',
        reclutamientos: 0
      });
    }

    console.log('✅ Reclutamientos encontrados:', reclutamientos.length);

    // 7. Obtener datos relacionados
    let investigaciones = [];
    let participantes = [];

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

    // 8. Probar creación de un evento de prueba
    try {
      const reclutamiento = reclutamientos[0];
      const investigacion = investigaciones.find(i => i.id === reclutamiento.investigacion_id);
      const participante = participantes.find(p => p.id === reclutamiento.participantes_id);

      const participanteInfo = participante?.nombre || 'Participante de Prueba';
      const titulo = `TEST - Reclutamiento - ${investigacion?.nombre || 'Investigación'} - ${participanteInfo}`;
      const descripcion = `Sesión de reclutamiento de prueba con ${participanteInfo}`;

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
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 30 }
          ]
        }
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event
      });

      console.log('✅ Evento de prueba creado exitosamente:', response.data.id);

      // Eliminar el evento de prueba
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: response.data.id
      });

      console.log('✅ Evento de prueba eliminado');

    } catch (eventError) {
      console.error('❌ Error creando evento de prueba:', eventError);
      return res.status(500).json({ 
        error: 'Error creando evento de prueba',
        details: eventError instanceof Error ? eventError.message : 'Error desconocido'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Diagnóstico de sincronización completado exitosamente',
      resultados: {
        tokens_encontrados: true,
        variables_entorno: true,
        acceso_google_calendar: true,
        reclutamientos_encontrados: reclutamientos.length,
        investigaciones_encontradas: investigaciones.length,
        participantes_encontrados: participantes.length,
        evento_prueba_creado: true,
        datos_reclutamientos: reclutamientos,
        datos_investigaciones: investigaciones,
        datos_participantes: participantes
      }
    });

  } catch (error) {
    console.error('❌ Error en diagnóstico de sincronización:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
