import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { nombre } = req.query;

    // Buscar participantes que contengan el nombre
    const { data: participantes, error } = await supabaseServer
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
      .ilike('nombre', `%${nombre}%`);

    if (error) {
      console.error('❌ Error buscando participantes:', error);
      return res.status(500).json({ error: 'Error buscando participantes', details: error.message });
    }

    console.log('🔍 Participantes encontrados:', participantes);

    return res.status(200).json({ participantes });

  } catch (error) {
    console.error('❌ Error en buscar-participante:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 