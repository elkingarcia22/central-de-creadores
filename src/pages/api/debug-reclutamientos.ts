import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de participante requerido' });
  }

  try {
    console.log('🔍 DEBUG RECLUTAMIENTOS - Buscando para participante:', id);

    // PASO 1: Buscar reclutamientos por participantes_id (externos)
    console.log('🔍 PASO 1: Buscando reclutamientos por participantes_id...');
    const { data: reclutamientosExternos, error: errorExternos } = await supabaseServer
      .from('reclutamientos')
      .select('id, investigacion_id, fecha_sesion, estado_agendamiento')
      .eq('participantes_id', id);

    console.log('🔍 Reclutamientos por participantes_id:', { data: reclutamientosExternos, error: errorExternos });

    // PASO 2: Buscar reclutamientos por participantes_internos_id
    console.log('🔍 PASO 2: Buscando reclutamientos por participantes_internos_id...');
    const { data: reclutamientosInternos, error: errorInternos } = await supabaseServer
      .from('reclutamientos')
      .select('id, investigacion_id, fecha_sesion, estado_agendamiento')
      .eq('participantes_internos_id', id);

    console.log('🔍 Reclutamientos por participantes_internos_id:', { data: reclutamientosInternos, error: errorInternos });

    // PASO 3: Buscar reclutamientos por participantes_friend_family_id
    console.log('🔍 PASO 3: Buscando reclutamientos por participantes_friend_family_id...');
    const { data: reclutamientosFriendFamily, error: errorFriendFamily } = await supabaseServer
      .from('reclutamientos')
      .select('id, investigacion_id, fecha_sesion, estado_agendamiento')
      .eq('participantes_friend_family_id', id);

    console.log('🔍 Reclutamientos por participantes_friend_family_id:', { data: reclutamientosFriendFamily, error: errorFriendFamily });

    // PASO 4: Buscar TODOS los reclutamientos para este participante
    console.log('🔍 PASO 4: Buscando TODOS los reclutamientos...');
    const { data: todosReclutamientos, error: errorTodos } = await supabaseServer
      .from('reclutamientos')
      .select('id, investigacion_id, participantes_id, participantes_internos_id, participantes_friend_family_id, fecha_sesion, estado_agendamiento')
      .or(`participantes_id.eq.${id},participantes_internos_id.eq.${id},participantes_friend_family_id.eq.${id}`);

    console.log('🔍 Todos los reclutamientos:', { data: todosReclutamientos, error: errorTodos });

    return res.status(200).json({
      id,
      reclutamientos: {
        por_participantes_id: reclutamientosExternos,
        por_participantes_internos_id: reclutamientosInternos,
        por_participantes_friend_family_id: reclutamientosFriendFamily,
        todos: todosReclutamientos
      },
      debug: {
        externos: { data: reclutamientosExternos, error: errorExternos },
        internos: { data: reclutamientosInternos, error: errorInternos },
        friend_family: { data: reclutamientosFriendFamily, error: errorFriendFamily },
        todos: { data: todosReclutamientos, error: errorTodos }
      }
    });

  } catch (error) {
    console.error('❌ Error en debug-reclutamientos:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
