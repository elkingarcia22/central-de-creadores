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
    console.log('🔍 Iniciando diagnóstico para usuario:', userId);

    // 1. Verificar si el usuario existe
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('id, nombre, email')
      .eq('id', userId)
      .single();

    if (usuarioError) {
      console.error('❌ Error obteniendo usuario:', usuarioError);
      return res.status(400).json({ 
        error: 'Usuario no encontrado',
        details: usuarioError.message
      });
    }

    console.log('✅ Usuario encontrado:', usuario);

    // 2. Verificar reclutamientos del usuario
    const { data: reclutamientos, error: reclutamientosError } = await supabase
      .from('reclutamientos')
      .select('*')
      .eq('reclutador_id', userId)
      .limit(5);

    if (reclutamientosError) {
      console.error('❌ Error obteniendo reclutamientos:', reclutamientosError);
      return res.status(500).json({ 
        error: 'Error obteniendo reclutamientos',
        details: reclutamientosError.message
      });
    }

    console.log('✅ Reclutamientos encontrados:', reclutamientos?.length || 0);

    // 3. Verificar investigaciones relacionadas
    if (reclutamientos && reclutamientos.length > 0) {
      const investigacionIds = reclutamientos.map(r => r.investigacion_id).filter(Boolean);
      
      if (investigacionIds.length > 0) {
        const { data: investigaciones, error: investigacionesError } = await supabase
          .from('investigaciones')
          .select('id, nombre, descripcion')
          .in('id', investigacionIds);

        if (investigacionesError) {
          console.error('❌ Error obteniendo investigaciones:', investigacionesError);
        } else {
          console.log('✅ Investigaciones encontradas:', investigaciones?.length || 0);
        }
      }
    }

    // 4. Verificar participantes relacionados
    if (reclutamientos && reclutamientos.length > 0) {
      const participanteIds = reclutamientos.map(r => r.participantes_id).filter(Boolean);
      
      if (participanteIds.length > 0) {
        const { data: participantes, error: participantesError } = await supabase
          .from('participantes')
          .select('id, nombre, apellido, email')
          .in('id', participanteIds);

        if (participantesError) {
          console.error('❌ Error obteniendo participantes:', participantesError);
        } else {
          console.log('✅ Participantes encontrados:', participantes?.length || 0);
        }
      }
    }

    // 5. Verificar participantes internos
    if (reclutamientos && reclutamientos.length > 0) {
      const participanteInternoIds = reclutamientos.map(r => r.participantes_internos_id).filter(Boolean);
      
      if (participanteInternoIds.length > 0) {
        const { data: participantesInternos, error: participantesInternosError } = await supabase
          .from('participantes_internos')
          .select('id, nombre, apellido, email')
          .in('id', participanteInternoIds);

        if (participantesInternosError) {
          console.error('❌ Error obteniendo participantes internos:', participantesInternosError);
        } else {
          console.log('✅ Participantes internos encontrados:', participantesInternos?.length || 0);
        }
      }
    }

    // 6. Verificar participantes friend & family
    if (reclutamientos && reclutamientos.length > 0) {
      const participanteFriendFamilyIds = reclutamientos.map(r => r.participantes_friend_family_id).filter(Boolean);
      
      if (participanteFriendFamilyIds.length > 0) {
        const { data: participantesFriendFamily, error: participantesFriendFamilyError } = await supabase
          .from('participantes_friend_family')
          .select('id, nombre, apellido, email')
          .in('id', participanteFriendFamilyIds);

        if (participantesFriendFamilyError) {
          console.error('❌ Error obteniendo participantes friend & family:', participantesFriendFamilyError);
        } else {
          console.log('✅ Participantes friend & family encontrados:', participantesFriendFamily?.length || 0);
        }
      }
    }

    // 7. Intentar query completo con joins
    console.log('🔍 Intentando query completo con joins...');
    
    const { data: reclutamientosCompletos, error: reclutamientosCompletosError } = await supabase
      .from('reclutamientos')
      .select(`
        *,
        investigaciones (
          id,
          nombre,
          descripcion
        ),
        participantes (
          id,
          nombre,
          apellido,
          email
        ),
        participantes_internos (
          id,
          nombre,
          apellido,
          email
        ),
        participantes_friend_family (
          id,
          nombre,
          apellido,
          email
        )
      `)
      .eq('reclutador_id', userId)
      .limit(3);

    if (reclutamientosCompletosError) {
      console.error('❌ Error en query completo:', reclutamientosCompletosError);
      return res.status(500).json({ 
        error: 'Error en query completo con joins',
        details: reclutamientosCompletosError.message,
        usuario: usuario,
        reclutamientos_basicos: reclutamientos
      });
    }

    console.log('✅ Query completo exitoso:', reclutamientosCompletos?.length || 0);

    res.status(200).json({
      success: true,
      message: 'Diagnóstico completado',
      usuario: usuario,
      reclutamientos_basicos: reclutamientos,
      reclutamientos_completos: reclutamientosCompletos,
      total_reclutamientos: reclutamientos?.length || 0
    });

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
