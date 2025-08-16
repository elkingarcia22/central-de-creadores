import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { usuarioId } = req.query;
    
    if (!usuarioId) {
      return res.status(400).json({ error: 'ID de usuario requerido' });
    }

    console.log('🔍 Debug: Obteniendo asignaciones para usuario:', usuarioId);

    // 1. Verificar si el usuario existe (usando auth.admin)
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(usuarioId as string);

    if (userError) {
      console.error('Error verificando usuario:', userError);
      return res.status(500).json({ error: 'Error verificando usuario', details: userError });
    }

    console.log('✅ Usuario encontrado:', userData);

    // 2. Verificar reclutamientos simples
    const { data: reclutamientos, error: errorReclutamientos } = await supabase
      .from('reclutamientos')
      .select('id, investigacion_id, responsable_agendamiento, estado_agendamiento')
      .eq('responsable_agendamiento', usuarioId);

    if (errorReclutamientos) {
      console.error('Error obteniendo reclutamientos:', errorReclutamientos);
      return res.status(500).json({ error: 'Error obteniendo reclutamientos', details: errorReclutamientos });
    }

    console.log('✅ Reclutamientos encontrados:', reclutamientos?.length || 0);

    // 3. Verificar todos los reclutamientos para comparar
    const { data: todosReclutamientos, error: errorTodos } = await supabase
      .from('reclutamientos')
      .select('id, investigacion_id, responsable_agendamiento, estado_agendamiento')
      .limit(10);

    if (errorTodos) {
      console.error('Error obteniendo todos los reclutamientos:', errorTodos);
      return res.status(500).json({ error: 'Error obteniendo todos los reclutamientos', details: errorTodos });
    }

    return res.status(200).json({
      usuario: userData,
      asignaciones: reclutamientos || [],
      total_asignaciones: reclutamientos?.length || 0,
      todos_reclutamientos: todosReclutamientos || [],
      debug_info: {
        usuarioId,
        total_reclutamientos: todosReclutamientos?.length || 0
      }
    });

  } catch (error) {
    console.error('❌ Error general en debug:', error);
    return res.status(500).json({ error: 'Error interno del servidor', details: error });
  }
}
