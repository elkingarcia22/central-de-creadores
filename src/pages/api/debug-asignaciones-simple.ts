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

    console.log('🔍 Debug simple: Obteniendo asignaciones para usuario:', usuarioId);

    // Consulta simple sin joins complejos
    const { data: reclutamientos, error } = await supabase
      .from('reclutamientos')
      .select('id, investigacion_id, participantes_id, estado_agendamiento, reclutador_id, fecha_sesion')
      .eq('reclutador_id', usuarioId);

    if (error) {
      console.error('Error obteniendo reclutamientos:', error);
      return res.status(500).json({ error: 'Error obteniendo reclutamientos', details: error });
    }

    console.log('✅ Reclutamientos encontrados:', reclutamientos?.length || 0);

    // Formatear datos simples
    const asignacionesFormateadas = (reclutamientos || []).map(r => ({
      reclutamiento_id: r.id,
      investigacion_id: r.investigacion_id,
      participante_id: r.participantes_id,
      estado_agendamiento: r.estado_agendamiento,
      fecha_sesion: r.fecha_sesion,
      investigacion_nombre: 'Por cargar',
      participante_nombre: 'Por cargar'
    }));

    return res.status(200).json({
      asignaciones: asignacionesFormateadas,
      total: asignacionesFormateadas.length,
      debug_info: {
        usuarioId,
        reclutamientos_encontrados: reclutamientos?.length || 0
      }
    });

  } catch (error) {
    console.error('❌ Error general en debug simple:', error);
    return res.status(500).json({ error: 'Error interno del servidor', details: error });
  }
}
