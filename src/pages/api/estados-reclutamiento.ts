import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Obtener estados de agendamiento
    const { data: estados, error } = await supabase
      .from('estado_agendamiento_cat')
      .select('*')
      .eq('activo', true)
      .order('nombre');

    if (error) {
      console.error('Error obteniendo estados:', error);
      return res.status(500).json({ error: 'Error obteniendo estados' });
    }

    // Obtener reclutamientos con estado_agendamiento
    const { data: reclutamientos, error: recError } = await supabase
      .from('reclutamientos')
      .select('id, investigacion_id, estado_agendamiento')
      .not('estado_agendamiento', 'is', null);

    if (recError) {
      console.error('Error obteniendo reclutamientos:', recError);
    }

    res.status(200).json({
      estados: estados || [],
      reclutamientosConEstado: reclutamientos || [],
      totalEstados: estados?.length || 0,
      totalReclutamientosConEstado: reclutamientos?.length || 0
    });
  } catch (error) {
    console.error('Error en API estados de reclutamiento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
} 