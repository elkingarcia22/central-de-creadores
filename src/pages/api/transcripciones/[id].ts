import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de transcripción requerido' });
  }

  if (req.method === 'PUT') {
    try {
      const { 
        estado, 
        fecha_fin, 
        duracion_total, 
        transcripcion_completa, 
        transcripcion_por_segmentos,
        idioma_detectado 
      } = req.body;

      // Preparar datos para actualizar
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (estado !== undefined) updateData.estado = estado;
      if (fecha_fin !== undefined) updateData.fecha_fin = fecha_fin;
      if (duracion_total !== undefined) updateData.duracion_total = duracion_total;
      if (transcripcion_completa !== undefined) updateData.transcripcion_completa = transcripcion_completa;
      if (transcripcion_por_segmentos !== undefined) updateData.transcripcion_por_segmentos = transcripcion_por_segmentos;
      if (idioma_detectado !== undefined) updateData.idioma_detectado = idioma_detectado;

      // Actualizar transcripción
      const { data, error } = await supabase
        .from('transcripciones_sesiones')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error actualizando transcripción:', error);
        return res.status(500).json({ error: 'Error al actualizar transcripción' });
      }

      console.log('✅ Transcripción actualizada:', id);
      return res.status(200).json(data);

    } catch (error) {
      console.error('Error en API transcripciones PUT:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  if (req.method === 'GET') {
    try {
      // Obtener transcripción específica
      const { data, error } = await supabase
        .from('transcripciones_sesiones')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error obteniendo transcripción:', error);
        return res.status(500).json({ error: 'Error al obtener transcripción' });
      }

      if (!data) {
        return res.status(404).json({ error: 'Transcripción no encontrada' });
      }

      return res.status(200).json(data);

    } catch (error) {
      console.error('Error en API transcripciones GET:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Eliminar transcripción
      const { error } = await supabase
        .from('transcripciones_sesiones')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error eliminando transcripción:', error);
        return res.status(500).json({ error: 'Error al eliminar transcripción' });
      }

      console.log('✅ Transcripción eliminada:', id);
      return res.status(200).json({ message: 'Transcripción eliminada exitosamente' });

    } catch (error) {
      console.error('Error en API transcripciones DELETE:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
