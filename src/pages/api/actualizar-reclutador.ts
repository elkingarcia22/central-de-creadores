import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { reclutamiento_id, reclutador_id } = req.body;

    // Actualizar el reclutador del reclutamiento
    const { data: reclutamiento, error } = await supabaseServer
      .from('reclutamientos')
      .update({
        reclutador_id: reclutador_id
      })
      .eq('id', reclutamiento_id)
      .select();

    if (error) {
      console.error('❌ Error actualizando reclutador:', error);
      return res.status(500).json({ error: 'Error actualizando reclutador', details: error.message });
    }

    console.log('✅ Reclutador actualizado:', reclutamiento);

    return res.status(200).json({ 
      success: true,
      reclutamiento: reclutamiento[0]
    });

  } catch (error) {
    console.error('❌ Error en actualizar-reclutador:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 