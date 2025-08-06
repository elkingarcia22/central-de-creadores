import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Obtener estados de participante desde la tabla correcta
      const { data, error } = await supabase
        .from('estado_participante_cat')
        .select('id, nombre')
        .eq('activo', true)
        .order('nombre');

      if (error) {
        console.error('Error obteniendo estados de participante:', error);
        return res.status(500).json({ error: 'Error al obtener estados de participante' });
      }

      console.log('✅ Estados de participante obtenidos:', data?.length || 0, 'estados');
      res.status(200).json(data || []);
    } catch (error) {
      console.error('Error en GET /api/estados-participante:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
} 