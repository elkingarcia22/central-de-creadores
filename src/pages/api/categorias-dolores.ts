import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔍 Obteniendo categorías de dolores...');

    const { data: categorias, error } = await supabaseServer
      .from('categorias_dolores')
      .select('*')
      .eq('activo', true)
      .order('orden', { ascending: true });

    if (error) {
      console.error('❌ Error obteniendo categorías:', error);
      return res.status(500).json({ error: 'Error al obtener categorías' });
    }

    console.log('✅ Categorías obtenidas:', categorias?.length || 0);

    return res.status(200).json(categorias || []);
  } catch (error) {
    console.error('❌ Error en la API:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
