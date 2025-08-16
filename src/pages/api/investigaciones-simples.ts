import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔍 Obteniendo investigaciones simples...');

    // Obtener solo los campos básicos
    const { data: investigaciones, error } = await supabase
      .from('investigaciones')
      .select('id, nombre, estado')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error obteniendo investigaciones:', error);
      return res.status(500).json({ error: 'Error obteniendo investigaciones' });
    }

    console.log('✅ Investigaciones obtenidas:', investigaciones?.length || 0);
    return res.status(200).json(investigaciones || []);

  } catch (error) {
    console.error('❌ Error en endpoint investigaciones simples:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
