import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de nota requerido' });
  }

  if (req.method === 'PUT') {
    try {
      const { contenido } = req.body;

      if (!contenido) {
        return res.status(400).json({ error: 'contenido es requerido' });
      }

      console.log('📝 Actualizando nota manual:', { id, contenido });

      const { data, error } = await supabaseServer
        .from('notas_manuales')
        .update({
          contenido: contenido.trim(),
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error actualizando nota:', error);
        return res.status(500).json({ error: 'Error al actualizar nota' });
      }

      console.log('✅ Nota actualizada exitosamente:', data.id);
      return res.status(200).json(data);

    } catch (error) {
      console.error('Error en API notas-manuales PUT:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      console.log('🗑️ Eliminando nota manual:', id);

      const { error } = await supabaseServer
        .from('notas_manuales')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error eliminando nota:', error);
        return res.status(500).json({ error: 'Error al eliminar nota' });
      }

      console.log('✅ Nota eliminada exitosamente:', id);
      return res.status(200).json({ message: 'Nota eliminada exitosamente' });

    } catch (error) {
      console.error('Error en API notas-manuales DELETE:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
