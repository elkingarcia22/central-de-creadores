import { NextApiRequest, NextApiResponse } from 'next';
import { supabase as supabaseServer } from '../../../api/supabase';

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

    // Verificar si el participante tiene reclutamientos/participaciones asociadas
    let participacionesCount = 0;
    let investigacionesNombres = [];
    
    // Verificar según el tipo de participante
    let reclutamientosQuery;
    switch (tipoParticipante) {
      case 'externo':
        reclutamientosQuery = supabaseServer
          .from('reclutamientos')
          .select('id, investigacion_id')
          .or(`participante_externo_id.eq.${id},participantes_id.eq.${id}`);
        break;
      case 'interno':
        reclutamientosQuery = supabaseServer
          .from('reclutamientos')
          .select('id, investigacion_id')
          .eq('participante_interno_id', id);
        break;
      case 'friend_family':
        reclutamientosQuery = supabaseServer
          .from('reclutamientos')
          .select('id, investigacion_id')
          .eq('participante_friend_family_id', id);
        break;
      default:
        reclutamientosQuery = supabaseServer
          .from('reclutamientos')
          .select('id, investigacion_id')
          .or(`participante_externo_id.eq.${id},participante_interno_id.eq.${id},participante_friend_family_id.eq.${id},participantes_id.eq.${id}`);
    }

    const { data: reclutamientos } = await reclutamientosQuery;

    if (reclutamientos && reclutamientos.length > 0) {
      participacionesCount = reclutamientos.length;
      
      // Obtener nombres de las investigaciones asociadas
      const investigacionIds = reclutamientos.map(r => r.investigacion_id).filter(Boolean);
      
      if (investigacionIds.length > 0) {
        const { data: investigaciones } = await supabaseServer
          .from('investigaciones')
          .select('id, nombre')
          .in('id', investigacionIds);
        
        investigacionesNombres = investigaciones?.map(inv => inv.nombre) || [];
      }

      return res.status(400).json({ 
        error: 'No se puede eliminar el participante',
        detail: `El participante tiene ${participacionesCount} participación${participacionesCount !== 1 ? 'es' : ''} asociada${participacionesCount !== 1 ? 's' : ''} en investigaciones.`,
        participaciones: participacionesCount,
        investigaciones: investigacionesNombres
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
      
      // Si es un error de clave foránea (participante tiene reclutamientos)
      if (error.code === '23503' && error.message.includes('reclutamientos')) {
        // Verificar participaciones para obtener información detallada
        let participacionesCount = 0;
        let investigacionesNombres = [];
        
        try {
          const { data: reclutamientos } = await supabaseServer
            .from('reclutamientos')
            .select('id, investigacion_id')
            .or(`participante_externo_id.eq.${id},participante_interno_id.eq.${id},participante_friend_family_id.eq.${id},participantes_id.eq.${id}`);

          if (reclutamientos && reclutamientos.length > 0) {
            participacionesCount = reclutamientos.length;
            
            const investigacionIds = reclutamientos.map(r => r.investigacion_id).filter(Boolean);
            if (investigacionIds.length > 0) {
              const { data: investigaciones } = await supabaseServer
                .from('investigaciones')
                .select('id, nombre')
                .in('id', investigacionIds);
              
              investigacionesNombres = investigaciones?.map(inv => inv.nombre) || [];
            }
          }
        } catch (e) {
          console.error('Error obteniendo detalles de participaciones:', e);
        }

        return res.status(400).json({ 
          error: 'No se puede eliminar el participante',
          detail: participacionesCount > 0 
            ? `El participante tiene ${participacionesCount} participación${participacionesCount !== 1 ? 'es' : ''} asociada${participacionesCount !== 1 ? 's' : ''} en investigaciones.`
            : 'El participante tiene participaciones asociadas en investigaciones.',
          participaciones: participacionesCount,
          investigaciones: investigacionesNombres
        });
      }
      
      return res.status(500).json({ error: 'Error al eliminar participante', detail: error.message });
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
