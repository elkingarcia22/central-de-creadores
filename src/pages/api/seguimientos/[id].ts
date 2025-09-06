import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Configurar headers para JSON
  res.setHeader('Content-Type', 'application/json');
  
  console.log('🔧 [SEGUIMIENTOS ID] Request recibido:', {
    method: req.method,
    url: req.url,
    query: req.query,
    body: req.body
  });

  if (req.method === 'PUT') {
    // Actualizar seguimiento
    try {
      const { id } = req.query;
      const { investigacion_id, fecha_seguimiento, notas, responsable_id, estado, participante_externo_id } = req.body;

      console.log('🔧 [SEGUIMIENTOS ID] PUT request recibido');
      console.log('🔧 [SEGUIMIENTOS ID] Query params:', req.query);
      console.log('🔧 [SEGUIMIENTOS ID] Body:', req.body);

      if (!id || typeof id !== 'string') {
        console.error('❌ [SEGUIMIENTOS ID] ID de seguimiento no válido:', id);
        return res.status(400).json({ error: 'ID de seguimiento requerido' });
      }

      console.log('🔧 Actualizando seguimiento:', id);
      console.log('📝 Datos:', { investigacion_id, fecha_seguimiento, notas, responsable_id, estado, participante_externo_id });

      console.log('🔧 [SEGUIMIENTOS ID] Ejecutando consulta a Supabase...');
      const { data, error } = await supabaseServer
        .from('seguimientos_investigacion')
        .update({
          investigacion_id,
          fecha_seguimiento,
          notas,
          responsable_id,
          estado: estado || 'pendiente',
          participante_externo_id: participante_externo_id || null,
          actualizado_el: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single();

      console.log('🔧 [SEGUIMIENTOS ID] Resultado de Supabase - data:', data);
      console.log('🔧 [SEGUIMIENTOS ID] Resultado de Supabase - error:', error);

      if (error) {
        console.error('❌ Error actualizando seguimiento:', error);
        return res.status(500).json({ 
          error: 'Error actualizando seguimiento', 
          details: error.message 
        });
      }

      console.log('✅ Seguimiento actualizado exitosamente:', data);

      return res.status(200).json({
        success: true,
        message: 'Seguimiento actualizado exitosamente',
        data
      });

    } catch (error) {
      console.error('❌ Error en seguimientos PUT:', error);
      return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
  }

  if (req.method === 'DELETE') {
    // Eliminar seguimiento
    try {
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'ID de seguimiento requerido' });
      }

      console.log('🗑️ Eliminando seguimiento:', id);

      const { error } = await supabaseServer
        .from('seguimientos_investigacion')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error eliminando seguimiento:', error);
        return res.status(500).json({ 
          error: 'Error eliminando seguimiento', 
          details: error.message 
        });
      }

      console.log('✅ Seguimiento eliminado exitosamente');

      return res.status(200).json({
        success: true,
        message: 'Seguimiento eliminado exitosamente'
      });

    } catch (error) {
      console.error('❌ Error en seguimientos DELETE:', error);
      return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
