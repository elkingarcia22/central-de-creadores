import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de participante requerido' });
  }

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('comentarios_participantes')
        .select('*')
        .eq('participante_id', id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error obteniendo comentarios:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      return res.status(200).json({ comentarios: data || [] });

    } catch (error) {
      console.error('Error en la API:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  if (req.method === 'POST') {
    const { contenido, sesion_relacionada } = req.body;

    if (!contenido || !contenido.trim()) {
      return res.status(400).json({ error: 'Contenido es requerido' });
    }

    try {
      const { data, error } = await supabase
        .from('comentarios_participantes')
        .insert([
          {
            participante_id: id,
            contenido: contenido.trim(),
            sesion_relacionada: sesion_relacionada?.trim() || null,
            creado_por: 'Usuario Actual', // TODO: Obtener usuario actual del contexto
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creando comentario:', error);
        return res.status(500).json({ error: 'Error al crear el comentario' });
      }

      return res.status(201).json(data);

    } catch (error) {
      console.error('Error en la API:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
