import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { usuarioId } = req.query;
      
      if (!usuarioId) {
        return res.status(400).json({ error: 'usuarioId es requerido' });
      }

      console.log('🔄 GET /api/usuario-por-id - Buscando usuario:', usuarioId);
      
      // Obtener usuario directamente de la tabla usuarios
      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          id,
          nombre,
          correo,
          foto_url
        `)
        .eq('id', usuarioId)
        .single();

      if (error) {
        console.error('❌ Error obteniendo usuario:', error);
        return res.status(500).json({ error: 'Error al obtener usuario' });
      }

      if (!data) {
        console.log('⚠️ Usuario no encontrado:', usuarioId);
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      console.log('✅ Usuario obtenido:', data);
      res.status(200).json(data);

    } catch (error) {
      console.error('❌ Error en GET /api/usuario-por-id:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
} 