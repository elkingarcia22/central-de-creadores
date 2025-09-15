import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔍 API sesiones-apoyo-new llamada:', req.method, req.url);
  
  if (req.method === 'GET') {
    return await handleGet(req, res);
  } else if (req.method === 'POST') {
    return await handlePost(req, res);
  } else if (req.method === 'PUT') {
    return await handlePut(req, res);
  } else if (req.method === 'DELETE') {
    return await handleDelete(req, res);
  } else {
    return res.status(405).json({ error: 'Método no permitido' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('🔄 Obteniendo sesiones de apoyo...');
    
    const { data, error } = await supabase
      .from('sesiones_apoyo')
      .select(`
        *,
        profiles!sesiones_apoyo_moderador_id_fkey(
          id,
          full_name,
          email
        )
      `)
      .order('fecha_programada', { ascending: true });

    if (error) {
      console.error('Error obteniendo sesiones de apoyo:', error);
      return res.status(500).json({ error: 'Error obteniendo sesiones de apoyo' });
    }

    // Función para mapear estado a estado_agendamiento
    const mapearEstadoAgendamiento = (estado: string) => {
      switch (estado) {
        case 'programada': return 'Pendiente';
        case 'en_curso': return 'En progreso';
        case 'completada': return 'Finalizado';
        case 'cancelada': return 'Cancelado';
        default: return 'Pendiente';
      }
    };

    // Formatear las sesiones para que tengan la misma estructura que las sesiones de reclutamiento
    const sesionesFormateadas = data?.map(sesion => ({
      id: sesion.id,
      titulo: sesion.titulo,
      descripcion: sesion.descripcion,
      fecha_programada: sesion.fecha_programada,
      hora_sesion: sesion.hora_sesion,
      duracion_minutos: sesion.duracion_minutos,
      estado: sesion.estado,
      estado_agendamiento: mapearEstadoAgendamiento(sesion.estado), // Mapear a nombre del estado
      estado_real: mapearEstadoAgendamiento(sesion.estado), // Estado real para el modal
      moderador_id: sesion.moderador_id,
      moderador_nombre: sesion.profiles?.full_name || 'Sin asignar',
      moderador_email: sesion.profiles?.email || '',
      responsable_real: sesion.profiles?.full_name || 'Sin asignar', // Moderador como responsable
      implementador_real: sesion.profiles?.full_name || 'Sin asignar', // Moderador como implementador
      observadores: sesion.observadores || [],
      objetivo_sesion: sesion.objetivo_sesion,
      meet_link: sesion.meet_link,
      tipo: 'apoyo', // Marcar como sesión de apoyo
      created_at: sesion.created_at,
      updated_at: sesion.updated_at
    })) || [];

    console.log('✅ Sesiones de apoyo formateadas:', sesionesFormateadas.length);

    return res.status(200).json({
      sesiones: sesionesFormateadas,
      total: sesionesFormateadas.length
    });
  } catch (error) {
    console.error('Error en handleGet:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      titulo,
      descripcion,
      fecha_programada,
      hora_sesion,
      duracion_minutos,
      moderador_id,
      observadores,
      objetivo_sesion,
      participantes_ids,
      meet_link
    } = req.body;

    if (!titulo || !fecha_programada || !duracion_minutos || !moderador_id) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: titulo, fecha_programada, duracion_minutos, moderador_id'
      });
    }

    const { data: sesion, error: sesionError } = await supabase
      .from('sesiones_apoyo')
      .insert({
        titulo,
        descripcion,
        fecha_programada: new Date(fecha_programada).toISOString(),
        hora_sesion,
        duracion_minutos: parseInt(duracion_minutos),
        moderador_id,
        observadores: observadores || [],
        objetivo_sesion,
        meet_link,
        estado: 'programada' // Mantener compatibilidad con campo existente
      })
      .select()
      .single();

    if (sesionError) {
      console.error('Error creando sesión de apoyo:', sesionError);
      return res.status(500).json({ error: 'Error creando sesión de apoyo' });
    }

    return res.status(201).json(sesion);
  } catch (error) {
    console.error('Error en handlePost:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID de sesión requerido' });
    }

    const { data, error } = await supabase
      .from('sesiones_apoyo')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando sesión de apoyo:', error);
      return res.status(500).json({ error: 'Error actualizando sesión de apoyo' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error en handlePut:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔍 DELETE request recibido:', req.method, req.url);
  console.log('🔍 Query params:', req.query);
  
  const { id } = req.query;

  if (!id) {
    console.log('❌ ID no proporcionado');
    return res.status(400).json({ error: 'ID de sesión requerido' });
  }

  try {
    console.log('🗑️ Eliminando sesión de apoyo:', id);

    // Eliminar la sesión de apoyo directamente
    const { error: sesionError } = await supabase
      .from('sesiones_apoyo')
      .delete()
      .eq('id', id);

    if (sesionError) {
      console.error('Error eliminando sesión de apoyo:', sesionError);
      return res.status(500).json({ error: 'Error eliminando sesión de apoyo' });
    }

    console.log('✅ Sesión de apoyo eliminada exitosamente:', id);
    return res.status(200).json({ message: 'Sesión de apoyo eliminada exitosamente' });
  } catch (error) {
    console.error('Error en DELETE sesiones-apoyo:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}