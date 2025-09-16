import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { participante_id, sesion_id } = req.query;

      if (!participante_id || !sesion_id) {
        return res.status(400).json({ error: 'participante_id y sesion_id son requeridos' });
      }

      console.log('📝 Obteniendo notas manuales para:', { participante_id, sesion_id });

      const { data, error } = await supabaseServer
        .from('notas_manuales')
        .select('*')
        .eq('participante_id', participante_id)
        .eq('sesion_id', sesion_id)
        .order('fecha_creacion', { ascending: false });

      if (error) {
        console.error('❌ Error obteniendo notas:', error);
        return res.status(500).json({ error: 'Error al obtener notas' });
      }

      console.log('✅ Notas obtenidas:', data?.length || 0);
      return res.status(200).json({ notas: data || [] });

    } catch (error) {
      console.error('Error en API notas-manuales GET:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { participante_id, sesion_id, contenido } = req.body;

      if (!participante_id || !sesion_id || !contenido) {
        return res.status(400).json({ error: 'participante_id, sesion_id y contenido son requeridos' });
      }

      console.log('📝 Creando nueva nota manual:', { participante_id, sesion_id, contenido });

      const { data, error } = await supabaseServer
        .from('notas_manuales')
        .insert({
          participante_id,
          sesion_id,
          contenido: contenido.trim(),
          fecha_creacion: new Date().toISOString(),
          fecha_actualizacion: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creando nota:', error);
        console.error('❌ Detalles del error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return res.status(500).json({ 
          error: 'Error al crear nota',
          details: error.message 
        });
      }

      console.log('✅ Nota creada exitosamente:', data.id);
      return res.status(201).json(data);

    } catch (error) {
      console.error('❌ Error en API notas-manuales POST:', error);
      console.error('❌ Stack trace:', error.stack);
      return res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
