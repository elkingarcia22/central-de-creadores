import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { investigacion_id } = req.query;

  if (!investigacion_id || typeof investigacion_id !== 'string') {
    return res.status(400).json({ error: 'investigacion_id requerido' });
  }

  try {
    console.log('🔍 Buscando reclutamientos para investigacion_id:', investigacion_id);

    const { data: reclutamientos, error } = await supabaseServer
      .from('reclutamientos')
      .select('*')
      .eq('investigacion_id', investigacion_id);

    if (error) {
      console.error('❌ Error obteniendo reclutamientos:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    console.log('✅ Reclutamientos encontrados:', reclutamientos?.length || 0);

    return res.status(200).json(reclutamientos || []);

  } catch (error) {
    console.error('❌ Error en API de reclutamientos por investigacion_id:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
