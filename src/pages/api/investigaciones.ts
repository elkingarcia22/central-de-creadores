import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔍 Obteniendo todas las investigaciones...');

    // Obtener todas las investigaciones (versión simple)
    const { data: investigaciones, error } = await supabase
      .from('investigaciones')
      .select('id, nombre, estado, creado_el')
      .order('creado_el', { ascending: false });

    if (error) {
      console.error('❌ Error obteniendo investigaciones:', error);
      return res.status(500).json({ error: 'Error obteniendo investigaciones' });
    }

    console.log('✅ Investigaciones obtenidas:', investigaciones?.length || 0);

    // Obtener los IDs de investigaciones que ya tienen reclutamiento
    const { data: reclutamientos, error: errorReclutamientos } = await supabase
      .from('reclutamientos')
      .select('investigacion_id');

    if (errorReclutamientos) {
      console.error('❌ Error obteniendo reclutamientos:', errorReclutamientos);
      return res.status(500).json({ error: 'Error obteniendo reclutamientos' });
    }

    const investigacionesConReclutamiento = new Set(
      reclutamientos?.map(r => r.investigacion_id) || []
    );

    // Marcar las investigaciones que ya tienen reclutamiento
    const investigacionesConEstado = investigaciones?.map(inv => ({
      ...inv,
      reclutamiento_id: investigacionesConReclutamiento.has(inv.id) ? inv.id : null
    })) || [];

    console.log('✅ Investigaciones procesadas:', investigacionesConEstado.length);

    return res.status(200).json(investigacionesConEstado);

  } catch (error) {
    console.error('❌ Error en endpoint investigaciones:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
