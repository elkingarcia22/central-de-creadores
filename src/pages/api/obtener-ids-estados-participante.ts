import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Obtener todos los estados de participante
    const { data: estados, error } = await supabase
      .from('estado_participante_cat')
      .select('id, nombre, activo')
      .eq('activo', true)
      .order('nombre');

    if (error) {
      console.error('Error obteniendo estados de participante:', error);
      return res.status(500).json({ error: 'Error al obtener estados de participante' });
    }

    // Crear un mapeo de nombre a ID
    const estadosMap: { [key: string]: string } = {};
    estados?.forEach(estado => {
      estadosMap[estado.nombre] = estado.id;
    });

    console.log('✅ Estados de participante obtenidos:', estados?.length || 0, 'estados');
    console.log('📋 Mapeo de estados:', estadosMap);

    return res.status(200).json({
      estados,
      estadosMap,
      total: estados?.length || 0
    });

  } catch (error) {
    console.error('Error en GET /api/obtener-ids-estados-participante:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
} 