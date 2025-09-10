import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { sesion_id } = req.query;

    if (!sesion_id) {
      return res.status(400).json({ error: 'ID de sesión requerido' });
    }

    console.log('🔍 Debug sesión para edición:', sesion_id);

    // Obtener datos del reclutamiento
    const { data: reclutamiento, error: reclutamientoError } = await supabaseServer
      .from('reclutamientos')
      .select(`
        id,
        investigacion_id,
        participantes_id,
        participantes_internos_id,
        participantes_friend_family_id,
        fecha_sesion,
        hora_sesion,
        duracion_sesion,
        estado_agendamiento,
        reclutador_id,
        meet_link
      `)
      .eq('id', sesion_id)
      .single();

    if (reclutamientoError || !reclutamiento) {
      console.error('❌ Error obteniendo reclutamiento:', reclutamientoError);
      return res.status(404).json({ error: 'Reclutamiento no encontrado' });
    }

    console.log('📊 Reclutamiento encontrado:', reclutamiento);

    // Obtener información del reclutador
    let reclutador = null;
    if (reclutamiento.reclutador_id) {
      console.log('🔍 Buscando reclutador con ID:', reclutamiento.reclutador_id);
      
      const { data: reclutadorData, error: reclutadorError } = await supabaseServer
        .from('usuarios')
        .select('id, full_name, email, avatar_url')
        .eq('id', reclutamiento.reclutador_id)
        .single();

      console.log('🔍 Resultado de búsqueda de reclutador:', { reclutadorData, reclutadorError });

      if (!reclutadorError && reclutadorData) {
        reclutador = reclutadorData;
        console.log('👤 Reclutador encontrado:', reclutador);
      } else {
        console.log('⚠️ No se encontró reclutador:', reclutadorError);
        
        // Intentar buscar en otras tablas o crear un reclutador temporal
        console.log('🔍 Creando reclutador temporal con ID:', reclutamiento.reclutador_id);
        reclutador = {
          id: reclutamiento.reclutador_id,
          full_name: 'Usuario no encontrado',
          email: '',
          avatar_url: ''
        };
      }
    }

    // Obtener información del participante
    let participante = null;
    let tipoParticipante = 'externo';

    if (reclutamiento.participantes_id) {
      const { data: participanteData } = await supabaseServer
        .from('participantes')
        .select('*')
        .eq('id', reclutamiento.participantes_id)
        .single();
      participante = participanteData ? { ...participanteData, tipo: 'externo' } : null;
      tipoParticipante = 'externo';
    } else if (reclutamiento.participantes_internos_id) {
      const { data: participanteData } = await supabaseServer
        .from('participantes_internos')
        .select('*')
        .eq('id', reclutamiento.participantes_internos_id)
        .single();
      participante = participanteData ? { ...participanteData, tipo: 'interno' } : null;
      tipoParticipante = 'interno';
    } else if (reclutamiento.participantes_friend_family_id) {
      const { data: participanteData } = await supabaseServer
        .from('participantes_friend_family')
        .select('*')
        .eq('id', reclutamiento.participantes_friend_family_id)
        .single();
      participante = participanteData ? { ...participanteData, tipo: 'friend_family' } : null;
      tipoParticipante = 'friend_family';
    }

    console.log('👥 Participante encontrado:', participante);
    console.log('🏷️ Tipo de participante:', tipoParticipante);

    // Formatear datos para el modal
    const datosParaModal = {
      id: reclutamiento.id,
      investigacion_id: reclutamiento.investigacion_id,
      participantes_id: participante?.id,
      fecha_sesion: reclutamiento.fecha_sesion,
      hora_sesion: reclutamiento.hora_sesion,
      duracion_sesion: reclutamiento.duracion_sesion,
      estado_agendamiento: reclutamiento.estado_agendamiento,
      reclutador_id: reclutamiento.reclutador_id,
      meet_link: reclutamiento.meet_link,
      // Datos para el modal
      responsable_pre_cargado: reclutador ? {
        id: reclutador.id,
        full_name: reclutador.full_name,
        email: reclutador.email,
        avatar_url: reclutador.avatar_url
      } : null,
      participante: participante,
      tipo_participante: tipoParticipante
    };

    console.log('📋 Datos formateados para modal:', datosParaModal);

    return res.status(200).json({
      success: true,
      reclutamiento: reclutamiento,
      reclutador: reclutador,
      participante: participante,
      tipo_participante: tipoParticipante,
      datos_para_modal: datosParaModal
    });

  } catch (error) {
    console.error('❌ Error en debug sesión edit:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
