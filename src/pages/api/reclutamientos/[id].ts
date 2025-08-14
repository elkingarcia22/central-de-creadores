import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer as supabase } from '../../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      console.log('🔍 Obteniendo reclutamiento con ID:', id);

      const { data, error } = await supabase
        .from('reclutamientos')
        .select('*')
        .eq('id', id);

      if (error) {
        console.error('Error obteniendo reclutamiento:', error);
        return res.status(500).json({ error: error.message });
      }

      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Reclutamiento no encontrado' });
      }

      console.log('✅ Reclutamiento obtenido exitosamente:', data[0]);
      return res.status(200).json(data[0]);
    } catch (error) {
      console.error('Error en la API:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else if (req.method === 'PUT') {
    try {
      console.log('🔄 Actualizando reclutamiento con ID:', id);
      console.log('📤 Datos recibidos:', req.body);

      const { data, error } = await supabase
        .from('reclutamientos')
        .update(req.body)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error actualizando reclutamiento:', error);
        return res.status(500).json({ error: error.message });
      }

      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Reclutamiento no encontrado' });
      }

      console.log('✅ Reclutamiento actualizado exitosamente:', data[0]);
      return res.status(200).json(data[0]);
    } catch (error) {
      console.error('Error en la API:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else if (req.method === 'DELETE') {
    try {
      console.log('🗑️ Eliminando reclutamiento con ID:', id);

      const { data, error } = await supabase
        .from('reclutamientos')
        .delete()
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error eliminando reclutamiento:', error);
        return res.status(500).json({ error: error.message });
      }

      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Reclutamiento no encontrado' });
      }

      console.log('✅ Reclutamiento eliminado exitosamente:', data[0]);
      return res.status(200).json({ message: 'Reclutamiento eliminado exitosamente', data: data[0] });
    } catch (error) {
      console.error('Error en la API:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 