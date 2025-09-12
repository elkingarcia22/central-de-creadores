import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { investigacion_id, usuarios_participantes } = req.body;

    if (!investigacion_id) {
      return res.status(400).json({ error: 'investigacion_id es requerido' });
    }

    console.log('🔄 Actualizando usuarios del libreto para investigación:', investigacion_id);
    console.log('👥 Usuarios participantes:', usuarios_participantes);

    // Actualizar el campo usuarios_participantes en el libreto
    const { data, error } = await supabaseServer
      .from('libretos_investigacion')
      .update({ 
        usuarios_participantes: usuarios_participantes || null 
      })
      .eq('investigacion_id', investigacion_id)
      .select();

    if (error) {
      console.error('❌ Error actualizando usuarios del libreto:', error);
      return res.status(500).json({ error: 'Error actualizando usuarios del libreto', details: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Libreto no encontrado para esta investigación' });
    }

    console.log('✅ Usuarios del libreto actualizados exitosamente');

    return res.status(200).json({ 
      success: true,
      libreto: data[0],
      message: 'Usuarios del libreto actualizados exitosamente'
    });

  } catch (error) {
    console.error('❌ Error en actualizar-usuarios:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
