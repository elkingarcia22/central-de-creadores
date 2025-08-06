import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { investigacion_id, estado_reclutamiento_id } = req.body;

    if (!investigacion_id || !estado_reclutamiento_id) {
      return res.status(400).json({ error: 'investigacion_id y estado_reclutamiento_id son requeridos' });
    }

    console.log('🔄 Actualizando estado de reclutamiento:', {
      investigacion_id,
      estado_reclutamiento_id
    });

    // Actualizar el estado de agendamiento en todos los reclutamientos de la investigación
    const { data, error } = await supabase
      .from('reclutamientos')
      .update({ 
        estado_agendamiento: estado_reclutamiento_id,
        updated_at: new Date().toISOString()
      })
      .eq('investigacion_id', investigacion_id)
      .select();

    if (error) {
      console.error('❌ Error actualizando estado de reclutamiento:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('✅ Estado de reclutamiento actualizado exitosamente:', data);
    return res.status(200).json({ 
      success: true, 
      message: 'Estado de reclutamiento actualizado correctamente',
      data 
    });

  } catch (error) {
    console.error('❌ Error en la API:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
} 