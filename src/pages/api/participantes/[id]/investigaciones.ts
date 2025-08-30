import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de participante requerido' });
  }

  try {
    console.log('🔍 Obteniendo investigaciones para participante:', id);

    // Primero obtener el tipo de participante
    let tipoParticipante = '';
    let participanteData = null;

    // Verificar en participantes (externos)
    let { data: participanteExterno, error: errorExterno } = await supabaseServer
      .from('participantes')
      .select('id, tipo')
      .eq('id', id)
      .single();

    console.log('🔍 Búsqueda en participantes:', { data: participanteExterno, error: errorExterno });

    if (participanteExterno) {
      tipoParticipante = 'externo';
      participanteData = participanteExterno;
    } else {
      // Verificar en participantes_internos
      let { data: participanteInterno, error: errorInterno } = await supabaseServer
        .from('participantes_internos')
        .select('id, tipo')
        .eq('id', id)
        .single();

      console.log('🔍 Búsqueda en participantes_internos:', { data: participanteInterno, error: errorInterno });

      if (participanteInterno) {
        tipoParticipante = 'interno';
        participanteData = participanteInterno;
      } else {
        // Verificar en participantes_friend_family
        let { data: participanteFriendFamily, error: errorFriendFamily } = await supabaseServer
          .from('participantes_friend_family')
          .select('id, tipo')
          .eq('id', id)
          .single();

        console.log('🔍 Búsqueda en participantes_friend_family:', { data: participanteFriendFamily, error: errorFriendFamily });

        if (participanteFriendFamily) {
          tipoParticipante = 'friend_family';
          participanteData = participanteFriendFamily;
        }
      }
    }

    if (!participanteData) {
      return res.status(404).json({ error: 'Participante no encontrado' });
    }

    console.log('🔍 Tipo de participante:', tipoParticipante);

    // Obtener reclutamientos usando participantes_id (como en empresa)
    console.log('🔍 Consultando reclutamientos para participantes_id:', id);
    
    const { data: reclutamientos, error: errorReclutamientos } = await supabaseServer
      .from('reclutamientos')
      .select(`
        id,
        investigacion_id,
        participantes_id,
        fecha_sesion,
        duracion_sesion,
        estado_agendamiento,
        investigaciones (
          id,
          nombre,
          descripcion,
          estado,
          fecha_inicio,
          fecha_fin,
          tipo_sesion,
          riesgo_automatico
        )
      `)
      .eq('participantes_id', id);

    console.log('🔍 Resultado consulta reclutamientos:', { 
      data: reclutamientos?.length || 0, 
      error: errorReclutamientos,
      sample: reclutamientos?.[0]
    });

    if (errorReclutamientos) {
      console.error('❌ Error obteniendo reclutamientos:', errorReclutamientos);
      return res.status(500).json({ error: 'Error obteniendo reclutamientos' });
    }

    console.log('🔍 Reclutamientos encontrados:', reclutamientos?.length || 0);

    // Procesar las investigaciones
    const investigaciones = reclutamientos
      ?.filter(r => r.investigaciones) // Solo incluir si tiene investigación
      .map(r => ({
        id: r.investigaciones.id,
        nombre: r.investigaciones.nombre,
        descripcion: r.investigaciones.descripcion,
        estado: r.investigaciones.estado,
        fecha_inicio: r.investigaciones.fecha_inicio,
        fecha_fin: r.investigaciones.fecha_fin,
        tipo_sesion: r.investigaciones.tipo_sesion,
        riesgo_automatico: r.investigaciones.riesgo_automatico,
        fecha_participacion: r.fecha_sesion,
        estado_agendamiento: r.estado_agendamiento,
        duracion_sesion: r.duracion_sesion
      })) || [];

    console.log('✅ Investigaciones procesadas:', investigaciones.length);

    return res.status(200).json({
      investigaciones,
      total: investigaciones.length
    });

  } catch (error) {
    console.error('❌ Error en endpoint investigaciones participante:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
