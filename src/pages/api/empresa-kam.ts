import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { empresaId } = req.query;
      
      if (!empresaId) {
        return res.status(400).json({ error: 'empresaId es requerido' });
      }

      console.log('🔄 GET /api/empresa-kam - Buscando KAM para empresa:', empresaId);
      
      // Obtener información de la empresa y su KAM
      const { data, error } = await supabase
        .from('empresas')
        .select(`
          id,
          nombre,
          kam_id,
          usuarios!empresas_kam_id_fkey (
            id,
            nombre,
            correo,
            foto_url
          )
        `)
        .eq('id', empresaId)
        .single();

      if (error) {
        console.error('❌ Error obteniendo KAM de empresa:', error);
        return res.status(500).json({ error: 'Error al obtener KAM de empresa' });
      }

      console.log('✅ KAM obtenido:', data);
      res.status(200).json(data);

    } catch (error) {
      console.error('❌ Error en GET /api/empresa-kam:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
} 