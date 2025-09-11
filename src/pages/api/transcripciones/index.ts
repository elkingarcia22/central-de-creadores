import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { reclutamiento_id, meet_link, estado, fecha_inicio } = req.body;

      // Validar datos requeridos
      if (!reclutamiento_id) {
        return res.status(400).json({ error: 'reclutamiento_id es requerido' });
      }

      // Crear nueva transcripción
      const { data, error } = await supabase
        .from('transcripciones_sesiones')
        .insert([
          {
            reclutamiento_id,
            meet_link: meet_link || '',
            estado: estado || 'procesando',
            fecha_inicio: fecha_inicio || new Date().toISOString(),
            idioma_detectado: 'es',
            transcripcion_por_segmentos: []
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creando transcripción:', error);
        return res.status(500).json({ error: 'Error al crear transcripción' });
      }

      console.log('✅ Transcripción creada:', data.id);
      return res.status(201).json(data);

    } catch (error) {
      console.error('Error en API transcripciones:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  if (req.method === 'GET') {
    try {
      const { reclutamiento_id } = req.query;

      let query = supabase
        .from('transcripciones_sesiones')
        .select('*')
        .order('created_at', { ascending: false });

      if (reclutamiento_id) {
        query = query.eq('reclutamiento_id', reclutamiento_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error obteniendo transcripciones:', error);
        return res.status(500).json({ error: 'Error al obtener transcripciones' });
      }

      return res.status(200).json(data);

    } catch (error) {
      console.error('Error en API transcripciones GET:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
