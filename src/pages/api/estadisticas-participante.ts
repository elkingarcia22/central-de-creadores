import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../src/api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { participanteId, email } = req.query;

  if (!participanteId && !email) {
    return res.status(400).json({ error: 'Se requiere participanteId o email' });
  }

  try {
    let participanteQuery = supabase
      .from('participantes')
      .select('*');

    if (participanteId) {
      participanteQuery = participanteQuery.eq('id', participanteId);
    } else if (email) {
      participanteQuery = participanteQuery.eq('email', email);
    }

    const { data: participante, error: participanteError } = await participanteQuery.single();

    if (participanteError || !participante) {
      return res.status(404).json({ error: 'Participante no encontrado' });
    }

    // Obtener todas las participaciones del participante
    const { data: participaciones, error: participacionesError } = await supabase
      .from('participantes')
      .select(`
        id,
        reclutamiento_id,
        fecha_sesion,
        hora_sesion,
        estado_agendamiento,
        reclutamientos!inner(
          id,
          investigacion_id,
          investigaciones(
            id,
            nombre,
            producto_nombre,
            periodo_nombre
          )
        )
      `)
      .eq('email', participante.email)
      .not('fecha_sesion', 'is', null)
      .order('fecha_sesion', { ascending: false });

    if (participacionesError) {
      console.error('Error obteniendo participaciones:', participacionesError);
      return res.status(500).json({ error: 'Error obteniendo participaciones' });
    }

    // Calcular estadísticas
    const total_participaciones = participaciones?.length || 0;
    const ultima_sesion = participaciones?.[0]?.fecha_sesion || null;
    const ultima_investigacion = participaciones?.[0]?.reclutamientos?.investigaciones || null;

    // Para participantes externos, estructurar la última sesión
    let ultima_sesion_formateada = null;
    if (participante.tipo === 'externo' && ultima_sesion) {
      ultima_sesion_formateada = {
        fecha: ultima_sesion,
        investigacion: ultima_investigacion?.nombre || 'Investigación sin nombre'
      };
    }

    const estadisticas = {
      total_participaciones,
      ultima_sesion: participante.tipo === 'externo' ? ultima_sesion_formateada : ultima_sesion,
      ultima_investigacion,
      participaciones: participaciones || []
    };

    return res.status(200).json(estadisticas);

  } catch (error) {
    console.error('Error en API estadisticas-participante:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
} 