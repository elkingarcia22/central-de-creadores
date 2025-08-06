import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Obtener estados reales de la tabla estado_agendamiento_cat
      const { data: estados, error } = await supabase
        .from('estado_agendamiento_cat')
        .select('*')
        .eq('activo', true)
        .order('nombre');

      if (error) {
        console.error('Error obteniendo estados de agendamiento:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      // Mapear los datos de la tabla a el formato esperado
      const estadosFormateados = estados?.map(estado => ({
        id: estado.id,
        nombre: estado.nombre,
        descripcion: estado.nombre === 'Pendiente de agendamiento' ? 'Sesión pendiente de agendar' :
                    estado.nombre === 'Pendiente' ? 'Sesión pendiente' :
                    estado.nombre === 'En progreso' ? 'Sesión en curso' :
                    estado.nombre === 'Finalizado' ? 'Sesión finalizada' :
                    estado.nombre === 'Cancelado' ? 'Sesión cancelada' : 'Estado sin descripción',
        color: estado.nombre === 'Pendiente de agendamiento' ? '#f59e0b' :
               estado.nombre === 'Pendiente' ? '#6b7280' :
               estado.nombre === 'En progreso' ? '#3b82f6' :
               estado.nombre === 'Finalizado' ? '#8b5cf6' :
               estado.nombre === 'Cancelado' ? '#ef4444' : '#6b7280',
        activo: estado.activo
      })) || [];

      res.status(200).json(estadosFormateados);
    } catch (error) {
      console.error('Error obteniendo estados de agendamiento:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 