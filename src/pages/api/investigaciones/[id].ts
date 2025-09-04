import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de investigación requerido' });
  }

  try {
    console.log('🔍 Obteniendo investigación con ID:', id);

    // Obtener la investigación por ID
    const { data: investigacion, error } = await supabaseServer
      .from('investigaciones')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Error obteniendo investigación:', error);
      return res.status(404).json({ error: 'Investigación no encontrada' });
    }

    if (!investigacion) {
      console.log('⚠️ Investigación no encontrada con ID:', id);
      return res.status(404).json({ error: 'Investigación no encontrada' });
    }

    console.log('✅ Investigación encontrada:', investigacion.nombre);

    return res.status(200).json(investigacion);

  } catch (error) {
    console.error('❌ Error en API de investigación por ID:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
