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

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'ID de usuario requerido' });
  }

  try {
    console.log('🔍 Iniciando diagnóstico de tablas relacionadas para usuario:', userId);

    // 1. Obtener reclutamientos básicos
    const { data: reclutamientos, error: reclutamientosError } = await supabase
      .from('reclutamientos')
      .select('*')
      .eq('reclutador_id', userId)
      .limit(3);

    if (reclutamientosError) {
      console.error('❌ Error obteniendo reclutamientos:', reclutamientosError);
      return res.status(500).json({ 
        error: 'Error obteniendo reclutamientos',
        details: reclutamientosError.message
      });
    }

    console.log('✅ Reclutamientos encontrados:', reclutamientos?.length || 0);

    const resultado = {
      reclutamientos_basicos: reclutamientos,
      tablas_relacionadas: {}
    };

    // 2. Probar tabla investigaciones
    try {
      const investigacionIds = reclutamientos?.map(r => r.investigacion_id).filter(Boolean) || [];
      
      if (investigacionIds.length > 0) {
        const { data: investigaciones, error: investigacionesError } = await supabase
          .from('investigaciones')
          .select('id, nombre, descripcion')
          .in('id', investigacionIds);

        if (investigacionesError) {
          console.error('❌ Error obteniendo investigaciones:', investigacionesError);
          resultado.tablas_relacionadas.investigaciones = {
            error: investigacionesError.message,
            ids_buscados: investigacionIds
          };
        } else {
          console.log('✅ Investigaciones encontradas:', investigaciones?.length || 0);
          resultado.tablas_relacionadas.investigaciones = {
            encontradas: investigaciones?.length || 0,
            datos: investigaciones
          };
        }
      } else {
        resultado.tablas_relacionadas.investigaciones = {
          mensaje: 'No hay IDs de investigación para buscar'
        };
      }
    } catch (error) {
      console.error('❌ Error en tabla investigaciones:', error);
      resultado.tablas_relacionadas.investigaciones = {
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }

    // 3. Probar tabla participantes
    try {
      const participanteIds = reclutamientos?.map(r => r.participantes_id).filter(Boolean) || [];
      
      if (participanteIds.length > 0) {
        const { data: participantes, error: participantesError } = await supabase
          .from('participantes')
          .select('*')
          .in('id', participanteIds);

        if (participantesError) {
          console.error('❌ Error obteniendo participantes:', participantesError);
          resultado.tablas_relacionadas.participantes = {
            error: participantesError.message,
            ids_buscados: participanteIds
          };
        } else {
          console.log('✅ Participantes encontrados:', participantes?.length || 0);
          resultado.tablas_relacionadas.participantes = {
            encontrados: participantes?.length || 0,
            datos: participantes
          };
        }
      } else {
        resultado.tablas_relacionadas.participantes = {
          mensaje: 'No hay IDs de participantes para buscar'
        };
      }
    } catch (error) {
      console.error('❌ Error en tabla participantes:', error);
      resultado.tablas_relacionadas.participantes = {
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }

    // 4. Probar tabla participantes_internos
    try {
      const participanteInternoIds = reclutamientos?.map(r => r.participantes_internos_id).filter(Boolean) || [];
      
      if (participanteInternoIds.length > 0) {
        const { data: participantesInternos, error: participantesInternosError } = await supabase
          .from('participantes_internos')
          .select('*')
          .in('id', participanteInternoIds);

        if (participantesInternosError) {
          console.error('❌ Error obteniendo participantes internos:', participantesInternosError);
          resultado.tablas_relacionadas.participantes_internos = {
            error: participantesInternosError.message,
            ids_buscados: participanteInternoIds
          };
        } else {
          console.log('✅ Participantes internos encontrados:', participantesInternos?.length || 0);
          resultado.tablas_relacionadas.participantes_internos = {
            encontrados: participantesInternos?.length || 0,
            datos: participantesInternos
          };
        }
      } else {
        resultado.tablas_relacionadas.participantes_internos = {
          mensaje: 'No hay IDs de participantes internos para buscar'
        };
      }
    } catch (error) {
      console.error('❌ Error en tabla participantes_internos:', error);
      resultado.tablas_relacionadas.participantes_internos = {
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }

    // 5. Probar tabla participantes_friend_family
    try {
      const participanteFriendFamilyIds = reclutamientos?.map(r => r.participantes_friend_family_id).filter(Boolean) || [];
      
      if (participanteFriendFamilyIds.length > 0) {
        const { data: participantesFriendFamily, error: participantesFriendFamilyError } = await supabase
          .from('participantes_friend_family')
          .select('*')
          .in('id', participanteFriendFamilyIds);

        if (participantesFriendFamilyError) {
          console.error('❌ Error obteniendo participantes friend & family:', participantesFriendFamilyError);
          resultado.tablas_relacionadas.participantes_friend_family = {
            error: participantesFriendFamilyError.message,
            ids_buscados: participanteFriendFamilyIds
          };
        } else {
          console.log('✅ Participantes friend & family encontrados:', participantesFriendFamily?.length || 0);
          resultado.tablas_relacionadas.participantes_friend_family = {
            encontrados: participantesFriendFamily?.length || 0,
            datos: participantesFriendFamily
          };
        }
      } else {
        resultado.tablas_relacionadas.participantes_friend_family = {
          mensaje: 'No hay IDs de participantes friend & family para buscar'
        };
      }
    } catch (error) {
      console.error('❌ Error en tabla participantes_friend_family:', error);
      resultado.tablas_relacionadas.participantes_friend_family = {
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }

    // 6. Intentar query completo con joins
    console.log('🔍 Intentando query completo con joins...');
    
    try {
      const { data: reclutamientosCompletos, error: reclutamientosCompletosError } = await supabase
        .from('reclutamientos')
        .select(`
          *,
          investigaciones (
            nombre
          ),
          participantes (
            *
          ),
          participantes_internos (
            *
          ),
          participantes_friend_family (
            *
          )
        `)
        .eq('reclutador_id', userId)
        .limit(3);

      if (reclutamientosCompletosError) {
        console.error('❌ Error en query completo:', reclutamientosCompletosError);
        resultado.query_completo = {
          error: reclutamientosCompletosError.message,
          detalles: reclutamientosCompletosError
        };
      } else {
        console.log('✅ Query completo exitoso:', reclutamientosCompletos?.length || 0);
        resultado.query_completo = {
          exitoso: true,
          encontrados: reclutamientosCompletos?.length || 0,
          datos: reclutamientosCompletos
        };
      }
    } catch (error) {
      console.error('❌ Error en query completo:', error);
      resultado.query_completo = {
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }

    res.status(200).json({
      success: true,
      message: 'Diagnóstico de tablas relacionadas completado',
      resultado: resultado
    });

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
