import { NextApiRequest, NextApiResponse } from 'next';
import { supabase as supabaseServer } from '../../../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de participante requerido' });
  }

  try {
    // Primero verificar si el participante existe y en qué tabla está
    let participanteEncontrado = false;
    let tipoParticipante = '';

    // Verificar en participantes externos
    let { data: participanteExterno } = await supabaseServer
      .from('participantes')
      .select('id')
      .eq('id', id)
      .single();

    if (participanteExterno) {
      participanteEncontrado = true;
      tipoParticipante = 'externo';
    }

    // Verificar en participantes internos
    if (!participanteEncontrado) {
      let { data: participanteInterno } = await supabaseServer
        .from('participantes_internos')
        .select('id')
        .eq('id', id)
        .single();

      if (participanteInterno) {
        participanteEncontrado = true;
        tipoParticipante = 'interno';
      }
    }

    // Verificar en participantes friend & family
    if (!participanteEncontrado) {
      let { data: participanteFriendFamily } = await supabaseServer
        .from('participantes_friend_family')
        .select('id')
        .eq('id', id)
        .single();

      if (participanteFriendFamily) {
        participanteEncontrado = true;
        tipoParticipante = 'friend_family';
      }
    }

    if (!participanteEncontrado) {
      return res.status(404).json({ error: 'Participante no encontrado' });
    }

    // Verificar si el participante tiene reclutamientos asociados
    let { data: reclutamientos } = await supabaseServer
      .from('reclutamientos')
      .select('id')
      .or(`participante_externo_id.eq.${id},participante_interno_id.eq.${id},participante_friend_family_id.eq.${id}`);

    if (reclutamientos && reclutamientos.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el participante',
        detail: `El participante está asociado a ${reclutamientos.length} reclutamiento(s). Primero debe eliminar los reclutamientos asociados.`
      });
    }

    // Verificar si el participante tiene dolores asociados
    let { data: dolores } = await supabaseServer
      .from('dolores_participante')
      .select('id')
      .eq('participante_id', id);

    if (dolores && dolores.length > 0) {
      // Eliminar dolores asociados
      const { error: errorDolores } = await supabaseServer
        .from('dolores_participante')
        .delete()
        .eq('participante_id', id);

      if (errorDolores) {
        console.error('Error eliminando dolores:', errorDolores);
        return res.status(500).json({ error: 'Error al eliminar dolores asociados' });
      }
    }

    // Verificar si el participante tiene comentarios asociados
    let { data: comentarios } = await supabaseServer
      .from('comentarios_participante')
      .select('id')
      .eq('participante_id', id);

    if (comentarios && comentarios.length > 0) {
      // Eliminar comentarios asociados
      const { error: errorComentarios } = await supabaseServer
        .from('comentarios_participante')
        .delete()
        .eq('participante_id', id);

      if (errorComentarios) {
        console.error('Error eliminando comentarios:', errorComentarios);
        return res.status(500).json({ error: 'Error al eliminar comentarios asociados' });
      }
    }

    // Eliminar el participante según su tipo
    let error;
    switch (tipoParticipante) {
      case 'externo':
        const { error: errorExterno } = await supabaseServer
          .from('participantes')
          .delete()
          .eq('id', id);
        error = errorExterno;
        break;

      case 'interno':
        const { error: errorInterno } = await supabaseServer
          .from('participantes_internos')
          .delete()
          .eq('id', id);
        error = errorInterno;
        break;

      case 'friend_family':
        const { error: errorFriendFamily } = await supabaseServer
          .from('participantes_friend_family')
          .delete()
          .eq('id', id);
        error = errorFriendFamily;
        break;

      default:
        return res.status(400).json({ error: 'Tipo de participante no válido' });
    }

    if (error) {
      console.error(`Error eliminando participante ${tipoParticipante}:`, error);
      return res.status(500).json({ error: 'Error al eliminar participante' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Participante eliminado correctamente',
      tipo: tipoParticipante
    });

  } catch (error) {
    console.error('Error en la API de eliminación:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
