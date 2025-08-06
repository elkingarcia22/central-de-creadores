import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { nombre, empresa_id, rol_empresa_id } = req.body;

    // Actualizar el participante "prueba 0000"
    const { data: participante, error } = await supabaseServer
      .from('participantes')
      .update({
        empresa_id: empresa_id,
        rol_empresa_id: rol_empresa_id
      })
      .eq('nombre', nombre)
      .select();

    if (error) {
      console.error('❌ Error actualizando participante:', error);
      return res.status(500).json({ error: 'Error actualizando participante', details: error.message });
    }

    console.log('✅ Participante actualizado:', participante);

    return res.status(200).json({ 
      success: true,
      participante: participante[0]
    });

  } catch (error) {
    console.error('❌ Error en actualizar-participante:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 