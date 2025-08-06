import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      console.log('🔄 GET /api/productos - Obteniendo productos...');

      // Obtener productos activos
      const { data, error } = await supabase
        .from('productos')
        .select('id, nombre')
        .eq('activo', true)
        .order('nombre');

      if (error) {
        console.error('❌ Error obteniendo productos:', error);
        return res.status(500).json({ error: 'Error al obtener productos' });
      }

      console.log('✅ Productos obtenidos:', data?.length || 0, 'productos');
      res.status(200).json(data || []);

    } catch (error) {
      console.error('❌ Error en GET /api/productos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
} 