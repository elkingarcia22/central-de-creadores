import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { userId, reclutamientoId } = req.query;

    if (!userId || !reclutamientoId) {
      return res.status(400).json({ error: 'userId y reclutamientoId son requeridos' });
    }

    console.log('🔍 Investigando reclutamiento fantasma:', { userId, reclutamientoId });

    // 1. Buscar el reclutamiento directamente por ID (sin filtros)
    const { data: reclutamientoDirecto, error: errorDirecto } = await supabaseServer
      .from('reclutamientos')
      .select('*')
      .eq('id', reclutamientoId)
      .single();

    console.log('🔍 Búsqueda directa:', { reclutamientoDirecto, errorDirecto });

    // 2. Buscar el reclutamiento con filtro de reclutador_id
    const { data: reclutamientoFiltrado, error: errorFiltrado } = await supabaseServer
      .from('reclutamientos')
      .select('*')
      .eq('id', reclutamientoId)
      .eq('reclutador_id', userId)
      .single();

    console.log('🔍 Búsqueda filtrada:', { reclutamientoFiltrado, errorFiltrado });

    // 3. Buscar en la vista de reclutamientos completa (si existe)
    const { data: vistaReclutamientos, error: errorVista } = await supabaseServer
      .from('vista_reclutamientos_completa')
      .select('*')
      .eq('id', reclutamientoId)
      .single();

    console.log('🔍 Búsqueda en vista:', { vistaReclutamientos, errorVista });

    // 4. Buscar todos los reclutamientos del usuario para comparar
    const { data: todosReclutamientos, error: errorTodos } = await supabaseServer
      .from('reclutamientos')
      .select('id, reclutador_id, fecha_sesion, updated_at')
      .eq('reclutador_id', userId)
      .order('updated_at', { ascending: false });

    console.log('🔍 Todos los reclutamientos del usuario:', todosReclutamientos);

    // 5. Buscar en google_calendar_events
    const { data: eventoGoogle, error: errorGoogle } = await supabaseServer
      .from('google_calendar_events')
      .select('*')
      .eq('sesion_id', reclutamientoId)
      .single();

    console.log('🔍 Evento de Google Calendar:', { eventoGoogle, errorGoogle });

    // 6. Análisis
    const analysis = {
      reclutamientoExiste: !!reclutamientoDirecto,
      reclutamientoAccesible: !!reclutamientoFiltrado,
      enVista: !!vistaReclutamientos,
      enGoogleEvents: !!eventoGoogle,
      totalReclutamientosUsuario: todosReclutamientos?.length || 0,
      reclutamientosUsuario: todosReclutamientos?.map(r => ({
        id: r.id,
        reclutador_id: r.reclutador_id,
        fecha_sesion: r.fecha_sesion,
        updated_at: r.updated_at
      })) || []
    };

    // 7. Verificar si el ID está en la lista de reclutamientos del usuario
    const estaEnListaUsuario = todosReclutamientos?.some(r => r.id === reclutamientoId) || false;

    console.log('📊 Análisis:', analysis);
    console.log('🎯 Está en lista del usuario:', estaEnListaUsuario);

    return res.status(200).json({
      success: true,
      reclutamientoId,
      userId,
      analysis,
      estaEnListaUsuario,
      datos: {
        reclutamientoDirecto,
        reclutamientoFiltrado,
        vistaReclutamientos,
        eventoGoogle,
        todosReclutamientos
      },
      errores: {
        errorDirecto: errorDirecto?.message,
        errorFiltrado: errorFiltrado?.message,
        errorVista: errorVista?.message,
        errorGoogle: errorGoogle?.message,
        errorTodos: errorTodos?.message
      }
    });

  } catch (error) {
    console.error('❌ Error investigando reclutamiento fantasma:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
