import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔍 Iniciando test con usuario específico');

    // Usar un usuario específico que sabemos que tiene reclutamientos
    // Basado en los datos que vimos anteriormente
    const userIds = [
      '9b1ef1eb-fdb4-410f-ab22-bfedc68294d6', // Usuario que vimos en los reclutamientos
      '37b272a8-8baa-493c-8877-f14d031e22a1', // Otro usuario que vimos
      '49a34b62-ece1-44fc-afda-67f3b27094ad'  // Otro usuario que vimos
    ];

    let usuario = null;
    let reclutamientos = [];

    // Probar con cada usuario hasta encontrar uno con reclutamientos
    for (const userId of userIds) {
      console.log(`🔍 Probando con usuario: ${userId}`);

      // Obtener usuario
      const { data: usuarioData, error: usuarioError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single();

      if (usuarioError) {
        console.log(`❌ Error obteniendo usuario ${userId}:`, usuarioError.message);
        continue;
      }

      // Obtener reclutamientos
      const { data: reclutamientosData, error: reclutamientosError } = await supabase
        .from('reclutamientos')
        .select('*')
        .eq('reclutador_id', userId)
        .limit(5);

      if (reclutamientosError) {
        console.log(`❌ Error obteniendo reclutamientos para ${userId}:`, reclutamientosError.message);
        continue;
      }

      if (reclutamientosData && reclutamientosData.length > 0) {
        usuario = usuarioData;
        reclutamientos = reclutamientosData;
        console.log(`✅ Usuario ${userId} tiene ${reclutamientos.length} reclutamientos`);
        break;
      } else {
        console.log(`⚠️ Usuario ${userId} no tiene reclutamientos`);
      }
    }

    if (!usuario || reclutamientos.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontró ningún usuario con reclutamientos',
        usuarios_probados: userIds
      });
    }

    console.log('✅ Usuario encontrado:', usuario);
    console.log('✅ Reclutamientos encontrados:', reclutamientos.length);

    // Obtener investigaciones por separado
    let investigaciones = [];
    if (reclutamientos.length > 0) {
      const investigacionIds = reclutamientos.map(r => r.investigacion_id).filter(Boolean);
      
      if (investigacionIds.length > 0) {
        const { data: investigacionesData, error: investigacionesError } = await supabase
          .from('investigaciones')
          .select('*')
          .in('id', investigacionIds);

        if (investigacionesError) {
          console.error('❌ Error obteniendo investigaciones:', investigacionesError);
        } else {
          investigaciones = investigacionesData || [];
          console.log('✅ Investigaciones encontradas:', investigaciones.length);
        }
      }
    }

    // Obtener participantes por separado
    let participantes = [];
    if (reclutamientos.length > 0) {
      const participanteIds = reclutamientos.map(r => r.participantes_id).filter(Boolean);
      
      if (participanteIds.length > 0) {
        const { data: participantesData, error: participantesError } = await supabase
          .from('participantes')
          .select('*')
          .in('id', participanteIds);

        if (participantesError) {
          console.error('❌ Error obteniendo participantes:', participantesError);
        } else {
          participantes = participantesData || [];
          console.log('✅ Participantes encontrados:', participantes.length);
        }
      }
    }

    // Obtener participantes internos por separado
    let participantesInternos = [];
    if (reclutamientos.length > 0) {
      const participanteInternoIds = reclutamientos.map(r => r.participantes_internos_id).filter(Boolean);
      
      if (participanteInternoIds.length > 0) {
        const { data: participantesInternosData, error: participantesInternosError } = await supabase
          .from('participantes_internos')
          .select('*')
          .in('id', participanteInternoIds);

        if (participantesInternosError) {
          console.error('❌ Error obteniendo participantes internos:', participantesInternosError);
        } else {
          participantesInternos = participantesInternosData || [];
          console.log('✅ Participantes internos encontrados:', participantesInternos.length);
        }
      }
    }

    // Obtener participantes friend & family por separado
    let participantesFriendFamily = [];
    if (reclutamientos.length > 0) {
      const participanteFriendFamilyIds = reclutamientos.map(r => r.participantes_friend_family_id).filter(Boolean);
      
      if (participanteFriendFamilyIds.length > 0) {
        const { data: participantesFriendFamilyData, error: participantesFriendFamilyError } = await supabase
          .from('participantes_friend_family')
          .select('*')
          .in('id', participanteFriendFamilyIds);

        if (participantesFriendFamilyError) {
          console.error('❌ Error obteniendo participantes friend & family:', participantesFriendFamilyError);
        } else {
          participantesFriendFamily = participantesFriendFamilyData || [];
          console.log('✅ Participantes friend & family encontrados:', participantesFriendFamily.length);
        }
      }
    }

    // Combinar datos manualmente
    const reclutamientosCompletos = reclutamientos.map(reclutamiento => {
      const investigacion = investigaciones.find(i => i.id === reclutamiento.investigacion_id);
      const participante = participantes.find(p => p.id === reclutamiento.participantes_id);
      const participanteInterno = participantesInternos.find(p => p.id === reclutamiento.participantes_internos_id);
      const participanteFriendFamily = participantesFriendFamily.find(p => p.id === reclutamiento.participantes_friend_family_id);

      return {
        ...reclutamiento,
        investigacion: investigacion || null,
        participante: participante || null,
        participanteInterno: participanteInterno || null,
        participanteFriendFamily: participanteFriendFamily || null
      };
    });

    console.log('✅ Datos combinados manualmente:', reclutamientosCompletos.length);

    res.status(200).json({
      success: true,
      message: 'Test con usuario específico completado',
      usuario: usuario,
      resultados: {
        reclutamientos_basicos: reclutamientos.length,
        investigaciones_encontradas: investigaciones.length,
        participantes_encontrados: participantes.length,
        participantes_internos_encontrados: participantesInternos.length,
        participantes_friend_family_encontrados: participantesFriendFamily.length,
        datos_combinados: reclutamientosCompletos.length,
        datos_reclutamientos: reclutamientos,
        datos_investigaciones: investigaciones,
        datos_participantes: participantes,
        datos_participantes_internos: participantesInternos,
        datos_participantes_friend_family: participantesFriendFamily,
        datos_completos: reclutamientosCompletos
      }
    });

  } catch (error) {
    console.error('❌ Error en test con usuario específico:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
