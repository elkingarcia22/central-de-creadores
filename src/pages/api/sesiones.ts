import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error) {
    console.error('Error en API sesiones:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { investigacion_id, fecha_inicio, fecha_fin, estado, tipo_sesion } = req.query;

  try {
    let query = supabase
      .from('sesiones')
      .select(`
        *,
        investigaciones!inner(
          id,
          nombre,
          color
        ),
        profiles!sesiones_moderador_id_fkey(
          id,
          full_name,
          email
        )
      `)
      .order('fecha_programada', { ascending: true });

    // Filtros
    if (investigacion_id) {
      query = query.eq('investigacion_id', investigacion_id);
    }

    if (fecha_inicio) {
      query = query.gte('fecha_programada', fecha_inicio);
    }

    if (fecha_fin) {
      query = query.lte('fecha_programada', fecha_fin);
    }

    if (estado) {
      query = query.eq('estado', estado);
    }

    if (tipo_sesion) {
      query = query.eq('tipo_sesion', tipo_sesion);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error consultando sesiones:', error);
      return res.status(500).json({ error: 'Error consultando sesiones' });
    }

    // Formatear datos
    const sesionesFormateadas = data?.map(sesion => ({
      id: sesion.id,
      investigacion_id: sesion.investigacion_id,
      investigacion_nombre: sesion.investigaciones?.nombre,
      investigacion_color: sesion.investigaciones?.color,
      titulo: sesion.titulo,
      descripcion: sesion.descripcion,
      fecha_programada: sesion.fecha_programada,
      duracion_minutos: sesion.duracion_minutos,
      estado: sesion.estado,
      tipo_sesion: sesion.tipo_sesion,
      ubicacion: sesion.ubicacion,
      sala: sesion.sala,
      moderador_id: sesion.moderador_id,
      moderador_nombre: sesion.profiles?.full_name,
      observadores: sesion.observadores || [],
      grabacion_permitida: sesion.grabacion_permitida,
      notas_publicas: sesion.notas_publicas,
      notas_privadas: sesion.notas_privadas,
      configuracion: sesion.configuracion || {},
      fecha_inicio_real: sesion.fecha_inicio_real,
      fecha_fin_real: sesion.fecha_fin_real,
      resultados: sesion.resultados || {},
      archivos_adjuntos: sesion.archivos_adjuntos || [],
      google_calendar_id: sesion.google_calendar_id,
      google_event_id: sesion.google_event_id,
      created_at: sesion.created_at,
      updated_at: sesion.updated_at
    })) || [];

    return res.status(200).json(sesionesFormateadas);
  } catch (error) {
    console.error('Error en GET sesiones:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const {
    titulo,
    descripcion,
    fecha_programada,
    duracion_minutos,
    tipo_sesion,
    ubicacion,
    sala,
    moderador_id,
    observadores,
    grabacion_permitida,
    notas_publicas,
    notas_privadas,
    participantes_ids,
    investigacion_id
  } = req.body;

  try {
    // Validaciones básicas
    if (!titulo || !fecha_programada || !duracion_minutos || !tipo_sesion) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: titulo, fecha_programada, duracion_minutos, tipo_sesion' 
      });
    }

    // Crear sesión
    const { data: sesion, error: sesionError } = await supabase
      .from('sesiones')
      .insert({
        investigacion_id: investigacion_id || null,
        titulo,
        descripcion,
        fecha_programada: new Date(fecha_programada).toISOString(),
        duracion_minutos: parseInt(duracion_minutos),
        tipo_sesion,
        ubicacion,
        sala,
        moderador_id,
        observadores: observadores || [],
        grabacion_permitida: grabacion_permitida || false,
        notas_publicas,
        notas_privadas,
        configuracion: {},
        estado: 'programada'
      })
      .select(`
        *,
        investigaciones!inner(
          id,
          nombre,
          color
        ),
        profiles!sesiones_moderador_id_fkey(
          id,
          full_name,
          email
        )
      `)
      .single();

    if (sesionError) {
      console.error('Error creando sesión:', sesionError);
      return res.status(500).json({ error: 'Error creando sesión' });
    }

    // Agregar participantes si se proporcionan
    if (participantes_ids && participantes_ids.length > 0) {
      const participantesData = participantes_ids.map((participante_id: string) => ({
        sesion_id: sesion.id,
        participante_id,
        estado: 'invitado'
      }));

      const { error: participantesError } = await supabase
        .from('sesion_participantes')
        .insert(participantesData);

      if (participantesError) {
        console.error('Error agregando participantes:', participantesError);
        // No fallar la creación de la sesión por esto
      }
    }

    // Formatear respuesta
    const sesionFormateada = {
      id: sesion.id,
      investigacion_id: sesion.investigacion_id,
      investigacion_nombre: sesion.investigaciones?.nombre,
      investigacion_color: sesion.investigaciones?.color,
      titulo: sesion.titulo,
      descripcion: sesion.descripcion,
      fecha_programada: sesion.fecha_programada,
      duracion_minutos: sesion.duracion_minutos,
      estado: sesion.estado,
      tipo_sesion: sesion.tipo_sesion,
      ubicacion: sesion.ubicacion,
      sala: sesion.sala,
      moderador_id: sesion.moderador_id,
      moderador_nombre: sesion.profiles?.full_name,
      observadores: sesion.observadores || [],
      grabacion_permitida: sesion.grabacion_permitida,
      notas_publicas: sesion.notas_publicas,
      notas_privadas: sesion.notas_privadas,
      configuracion: sesion.configuracion || {},
      fecha_inicio_real: sesion.fecha_inicio_real,
      fecha_fin_real: sesion.fecha_fin_real,
      resultados: sesion.resultados || {},
      archivos_adjuntos: sesion.archivos_adjuntos || [],
      google_calendar_id: sesion.google_calendar_id,
      google_event_id: sesion.google_event_id,
      created_at: sesion.created_at,
      updated_at: sesion.updated_at
    };

    return res.status(201).json(sesionFormateada);
  } catch (error) {
    console.error('Error en POST sesiones:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
