import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Se requiere un array de IDs de empresas' });
    }

    const { error } = await supabase
      .from('empresas')
      .delete()
      .in('id', ids);

    if (error) {
      console.error('Error eliminando empresas:', error);
      return res.status(500).json({ error: 'Error al eliminar las empresas' });
    }

    return res.status(200).json({ 
      message: `${ids.length} empresa(s) eliminada(s) correctamente` 
    });
  } catch (error) {
    console.error('Error en la API:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
