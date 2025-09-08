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
    console.log('🔍 Iniciando test simple para usuario:', userId);

    // 1. Test básico de conexión a Supabase
    const { data: testConnection, error: testError } = await supabase
      .from('usuarios')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Error de conexión a Supabase:', testError);
      return res.status(500).json({ 
        error: 'Error de conexión a Supabase',
        details: testError.message
      });
    }

    console.log('✅ Conexión a Supabase OK');

    // 2. Test de reclutamientos básicos
    const { data: reclutamientos, error: reclutamientosError } = await supabase
      .from('reclutamientos')
      .select('id, investigacion_id, fecha_sesion, duracion_sesion, reclutador_id')
      .eq('reclutador_id', userId)
      .limit(3);

    if (reclutamientosError) {
      console.error('❌ Error obteniendo reclutamientos:', reclutamientosError);
      return res.status(500).json({ 
        error: 'Error obteniendo reclutamientos',
        details: reclutamientosError.message,
        userId: userId
      });
    }

    console.log('✅ Reclutamientos encontrados:', reclutamientos?.length || 0);

    // 3. Test de investigaciones
    if (reclutamientos && reclutamientos.length > 0) {
      const investigacionIds = reclutamientos.map(r => r.investigacion_id).filter(Boolean);
      
      if (investigacionIds.length > 0) {
        const { data: investigaciones, error: investigacionesError } = await supabase
          .from('investigaciones')
          .select('id, nombre')
          .in('id', investigacionIds);

        if (investigacionesError) {
          console.error('❌ Error obteniendo investigaciones:', investigacionesError);
          return res.status(500).json({ 
            error: 'Error obteniendo investigaciones',
            details: investigacionesError.message,
            investigacionIds: investigacionIds
          });
        }

        console.log('✅ Investigaciones encontradas:', investigaciones?.length || 0);
      }
    }

    // 4. Test de participantes
    if (reclutamientos && reclutamientos.length > 0) {
      const participanteIds = reclutamientos.map(r => r.participantes_id).filter(Boolean);
      
      if (participanteIds.length > 0) {
        const { data: participantes, error: participantesError } = await supabase
          .from('participantes')
          .select('id, nombre')
          .in('id', participanteIds);

        if (participantesError) {
          console.error('❌ Error obteniendo participantes:', participantesError);
          return res.status(500).json({ 
            error: 'Error obteniendo participantes',
            details: participantesError.message,
            participanteIds: participanteIds
          });
        }

        console.log('✅ Participantes encontrados:', participantes?.length || 0);
      }
    }

    // 5. Test de query con joins
    console.log('🔍 Probando query con joins...');
    
    const { data: reclutamientosCompletos, error: reclutamientosCompletosError } = await supabase
      .from('reclutamientos')
      .select(`
        id,
        investigacion_id,
        fecha_sesion,
        duracion_sesion,
        reclutador_id,
        investigaciones (
          nombre
        )
      `)
      .eq('reclutador_id', userId)
      .limit(2);

    if (reclutamientosCompletosError) {
      console.error('❌ Error en query con joins:', reclutamientosCompletosError);
      return res.status(500).json({ 
        error: 'Error en query con joins',
        details: reclutamientosCompletosError.message
      });
    }

    console.log('✅ Query con joins exitoso:', reclutamientosCompletos?.length || 0);

    res.status(200).json({
      success: true,
      message: 'Test simple completado',
      resultados: {
        conexion_supabase: 'OK',
        reclutamientos_basicos: reclutamientos?.length || 0,
        query_con_joins: reclutamientosCompletos?.length || 0,
        datos_reclutamientos: reclutamientos,
        datos_completos: reclutamientosCompletos
      }
    });

  } catch (error) {
    console.error('❌ Error en test simple:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
