import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de reclutamiento requerido' });
  }

  try {
    console.log('🔍 Obteniendo participantes para reclutamiento:', id);

    // Obtener el reclutamiento para ver qué tipo de participantes tiene
    const { data: reclutamiento, error: errorReclutamiento } = await supabaseServer
      .from('reclutamientos')
      .select('*')
      .eq('id', id)
      .single();

    if (errorReclutamiento || !reclutamiento) {
      console.error('❌ Error obteniendo reclutamiento:', errorReclutamiento);
      return res.status(404).json({ error: 'Reclutamiento no encontrado' });
    }

    console.log('✅ Reclutamiento encontrado:', reclutamiento);

    // Buscar participantes según el tipo
    let participantes = [];

    if (reclutamiento.participantes_id) {
      // Participante externo
      const { data: participanteExterno, error: errorExterno } = await supabaseServer
        .from('participantes')
        .select('*')
        .eq('id', reclutamiento.participantes_id)
        .single();

      if (!errorExterno && participanteExterno) {
        participantes.push({
          ...participanteExterno,
          tipo: 'externo',
          reclutamiento_id: reclutamiento.id
        });
      }
    }

    if (reclutamiento.participantes_internos_id) {
      // Participante interno
      const { data: participanteInterno, error: errorInterno } = await supabaseServer
        .from('participantes_internos')
        .select('*')
        .eq('id', reclutamiento.participantes_internos_id)
        .single();

      if (!errorInterno && participanteInterno) {
        participantes.push({
          ...participanteInterno,
          tipo: 'interno',
          reclutamiento_id: reclutamiento.id
        });
      }
    }

    if (reclutamiento.participantes_friend_family_id) {
      // Participante friend & family
      const { data: participanteFriendFamily, error: errorFriendFamily } = await supabaseServer
        .from('participantes_friend_family')
        .select('*')
        .eq('id', reclutamiento.participantes_friend_family_id)
        .single();

      if (!errorFriendFamily && participanteFriendFamily) {
        participantes.push({
          ...participanteFriendFamily,
          tipo: 'friend_family',
          reclutamiento_id: reclutamiento.id
        });
      }
    }

    console.log('✅ Participantes encontrados:', participantes.length);

    return res.status(200).json({
      participantes: participantes,
      reclutamiento: {
        id: reclutamiento.id,
        fecha_sesion: reclutamiento.fecha_sesion,
        hora_sesion: reclutamiento.hora_sesion,
        duracion_sesion: reclutamiento.duracion_sesion,
        estado_agendamiento: reclutamiento.estado_agendamiento,
        reclutador_id: reclutamiento.reclutador_id
      }
    });

  } catch (error) {
    console.error('❌ Error en API de participantes del reclutamiento:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
