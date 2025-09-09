import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { reclutamientoId, userId } = req.query;

    if (!reclutamientoId) {
      return res.status(400).json({ error: 'reclutamientoId es requerido' });
    }

    console.log('🔍 Verificando existencia de reclutamiento:', { reclutamientoId, userId });

    // 1. Buscar el reclutamiento sin filtro de reclutador_id
    const { data: reclutamiento, error: reclutamientoError } = await supabaseServer
      .from('reclutamientos')
      .select(`
        *,
        investigaciones!inner(
          id,
          nombre,
          descripcion,
          responsable_id,
          implementador_id
        )
      `)
      .eq('id', reclutamientoId)
      .single();

    if (reclutamientoError || !reclutamiento) {
      return res.status(404).json({ 
        error: 'Reclutamiento no encontrado en la base de datos',
        details: reclutamientoError?.message
      });
    }

    console.log('✅ Reclutamiento encontrado:', reclutamiento);

    // 2. Verificar si el usuario es el reclutador
    const isReclutador = reclutamiento.reclutador_id === userId;
    const isResponsable = reclutamiento.investigaciones?.responsable_id === userId;
    const isImplementador = reclutamiento.investigaciones?.implementador_id === userId;

    // 3. Verificar si el usuario tiene acceso
    const hasAccess = isReclutador || isResponsable || isImplementador;

    // 4. Obtener información del participante si existe
    let participante = null;
    if (reclutamiento.participantes_id) {
      const { data: participanteData, error: participanteError } = await supabaseServer
        .from('participantes')
        .select('*')
        .eq('id', reclutamiento.participantes_id)
        .single();

      if (participanteError) {
        console.log('⚠️ Error obteniendo participante:', participanteError.message);
      } else {
        participante = participanteData;
        console.log('✅ Participante encontrado:', participante);
      }
    }

    // 5. Verificar si ya existe un evento de Google Calendar
    const { data: existingEvent, error: existingEventError } = await supabaseServer
      .from('google_calendar_events')
      .select('*')
      .eq('sesion_id', reclutamientoId)
      .single();

    console.log('🔍 Evento existente:', existingEvent);
    console.log('🔍 Error al buscar evento:', existingEventError?.message);

    return res.status(200).json({
      success: true,
      reclutamiento: {
        id: reclutamiento.id,
        fecha_sesion: reclutamiento.fecha_sesion,
        duracion_sesion: reclutamiento.duracion_sesion,
        meet_link: reclutamiento.meet_link,
        reclutador_id: reclutamiento.reclutador_id,
        participantes_id: reclutamiento.participantes_id,
        investigacion: reclutamiento.investigaciones,
        participante
      },
      access: {
        hasAccess,
        isReclutador,
        isResponsable,
        isImplementador,
        userId
      },
      existingEvent,
      debug: {
        reclutamientoFound: !!reclutamiento,
        participanteFound: !!participante,
        existingEventFound: !!existingEvent,
        userIdMatches: reclutamiento.reclutador_id === userId
      }
    });

  } catch (error) {
    console.error('❌ Error verificando reclutamiento:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
