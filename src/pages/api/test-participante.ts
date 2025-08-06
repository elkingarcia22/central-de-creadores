import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Consulta directa al participante "prueba 12344"
    const { data: participante, error } = await supabaseServer
      .from('participantes')
      .select(`
        id,
        nombre,
        email,
        tipo,
        rol_empresa_id,
        empresa_id,
        kam_id,
        descripción,
        doleres_necesidades,
        fecha_ultima_participacion,
        total_participaciones,
        productos_relacionados,
        estado_participante,
        created_at,
        updated_at,
        roles_empresa(id, nombre)
      `)
      .eq('nombre', 'prueba 12344')
      .single();

    if (error) {
      console.error('❌ Error obteniendo participante:', error);
      return res.status(500).json({ error: 'Error obteniendo participante', details: error.message });
    }

    console.log('🔍 Participante obtenido directamente:', participante);

    return res.status(200).json({ participante });

  } catch (error) {
    console.error('❌ Error en test-participante:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 