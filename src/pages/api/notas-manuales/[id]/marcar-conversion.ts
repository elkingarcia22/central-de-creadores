import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de nota requerido' });
  }

  if (req.method === 'PUT') {
    try {
      const { tipo_conversion, entidad_id } = req.body;

      if (!tipo_conversion || !entidad_id) {
        return res.status(400).json({ 
          error: 'tipo_conversion y entidad_id son requeridos' 
        });
      }

      if (!['dolor', 'perfilamiento'].includes(tipo_conversion)) {
        return res.status(400).json({ 
          error: 'tipo_conversion debe ser "dolor" o "perfilamiento"' 
        });
      }

      console.log('🔄 Marcando conversión de nota:', { 
        notaId: id, 
        tipo_conversion, 
        entidad_id 
      });

      const updateData: any = {
        fecha_actualizacion: new Date().toISOString()
      };

      if (tipo_conversion === 'dolor') {
        updateData.convertida_a_dolor = true;
        updateData.dolor_id = entidad_id;
      } else if (tipo_conversion === 'perfilamiento') {
        updateData.convertida_a_perfilamiento = true;
        updateData.perfilamiento_id = entidad_id;
      }

      const { data, error } = await supabaseServer
        .from('notas_manuales')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error marcando conversión:', error);
        return res.status(500).json({ 
          error: 'Error al marcar conversión',
          details: error.message 
        });
      }

      console.log('✅ Conversión marcada exitosamente:', data.id);
      return res.status(200).json(data);

    } catch (error) {
      console.error('Error en API marcar-conversion:', error);
      return res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
