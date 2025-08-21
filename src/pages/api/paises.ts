import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { data, error } = await supabase
      .from('paises')
      .select('id, nombre')
      .order('nombre');

    if (error) {
      console.error('Error obteniendo países:', error);
      return res.status(500).json({ error: 'Error al obtener países' });
    }

    return res.status(200).json(data || []);
  } catch (error) {
    console.error('Error en la API:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
