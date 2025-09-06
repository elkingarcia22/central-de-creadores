import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { investigacion_id } = req.query;

    // Construir query base
    let query = supabase.from('sesiones').select('*');

    if (investigacion_id) {
      query = query.eq('investigacion_id', investigacion_id);
    }

    const { data: sesiones, error } = await query;

    if (error) {
      console.error('Error consultando estadísticas de sesiones:', error);
      return res.status(500).json({ error: 'Error consultando estadísticas' });
    }

    if (!sesiones) {
      return res.status(200).json({
        total: 0,
        programadas: 0,
        en_curso: 0,
        completadas: 0,
        canceladas: 0,
        esta_semana: 0,
        este_mes: 0
      });
    }

    // Calcular estadísticas
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = {
      total: sesiones.length,
      programadas: sesiones.filter(s => s.estado === 'programada').length,
      en_curso: sesiones.filter(s => s.estado === 'en_curso').length,
      completadas: sesiones.filter(s => s.estado === 'completada').length,
      canceladas: sesiones.filter(s => s.estado === 'cancelada').length,
      esta_semana: sesiones.filter(s => {
        const fechaSesion = new Date(s.fecha_programada);
        return fechaSesion >= startOfWeek && fechaSesion <= now;
      }).length,
      este_mes: sesiones.filter(s => {
        const fechaSesion = new Date(s.fecha_programada);
        return fechaSesion >= startOfMonth && fechaSesion <= now;
      }).length
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error en API estadísticas sesiones:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
