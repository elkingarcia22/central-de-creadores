import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de nota requerido' });
  }

  if (req.method === 'PUT') {
    try {
      const { contenido, semaforo_riesgo } = req.body;

      console.log('🔍 [DEBUG] API PUT - Request body:', { contenido, semaforo_riesgo });
      console.log('🔍 [DEBUG] API PUT - ID:', id);

      if (!contenido) {
        console.log('❌ [DEBUG] API PUT - Error: contenido es requerido');
        return res.status(400).json({ error: 'contenido es requerido' });
      }

      // Validar semaforo_riesgo si se proporciona
      if (semaforo_riesgo && !['neutral', 'verde', 'amarillo', 'rojo'].includes(semaforo_riesgo)) {
        console.log('❌ [DEBUG] API PUT - Error: semaforo_riesgo inválido:', semaforo_riesgo);
        return res.status(400).json({ error: 'semaforo_riesgo debe ser neutral, verde, amarillo o rojo' });
      }

      console.log('📝 [DEBUG] API PUT - Actualizando nota manual:', { id, contenido, semaforo_riesgo });

      const updateData: any = {
        contenido: contenido.trim(),
        fecha_actualizacion: new Date().toISOString()
      };

      // Solo actualizar semaforo_riesgo si se proporciona
      if (semaforo_riesgo) {
        updateData.semaforo_riesgo = semaforo_riesgo;
      }

      console.log('🔍 [DEBUG] API PUT - updateData:', updateData);

      const { data, error } = await supabaseServer
        .from('notas_manuales')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      console.log('🔍 [DEBUG] API PUT - Supabase response:', { data, error });

      if (error) {
        console.error('❌ [DEBUG] API PUT - Error actualizando nota:', error);
        return res.status(500).json({ error: 'Error al actualizar nota' });
      }

      console.log('✅ [DEBUG] API PUT - Nota actualizada exitosamente:', data.id);
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
