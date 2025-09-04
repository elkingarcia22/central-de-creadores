import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de participante requerido' });
  }

  try {
    // Primero, buscar en la tabla de participantes para obtener el reclutamiento_id
    const { data: participanteData, error: participanteError } = await supabase
      .from('participantes')
      .select('reclutamiento_id')
      .eq('id', id)
      .single();

    if (participanteError) {
      console.error('Error consultando participante:', participanteError);
      return res.status(404).json({ error: 'Participante no encontrado' });
    }

    if (!participanteData?.reclutamiento_id) {
      return res.status(404).json({ error: 'Participante no tiene reclutamiento asignado' });
    }

    // Ahora buscar el reclutamiento usando el ID obtenido
    const { data: reclutamientos, error } = await supabase
      .from('reclutamientos')
      .select('*')
      .eq('id', participanteData.reclutamiento_id)
      .single();

    if (error) {
      console.error('Error consultando reclutamientos:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (error) {
      console.error('Error consultando reclutamiento:', error);
      return res.status(404).json({ error: 'Reclutamiento no encontrado' });
    }

    if (!reclutamientos) {
      return res.status(404).json({ error: 'Reclutamiento no encontrado' });
    }

    const reclutamiento = reclutamientos;
    
    // Formatear la respuesta
    const reclutamientoFormateado = {
      id: reclutamiento.id,
      nombre: reclutamiento.nombre,
      descripcion: reclutamiento.descripcion,
      fecha_inicio: reclutamiento.fecha_inicio,
      hora_inicio: reclutamiento.hora_inicio,
      duracion_sesion: reclutamiento.duracion_sesion,
      estado: reclutamiento.estado,
      responsable: reclutamiento.responsable,
      implementador: reclutamiento.implementador,
      tipo_investigacion: reclutamiento.tipo_investigacion,
      objetivo: reclutamiento.objetivo,
      criterios: reclutamiento.criterios,
      fecha_creacion: reclutamiento.created_at,
      fecha_actualizacion: reclutamiento.updated_at
    };

    return res.status(200).json({
      reclutamiento: reclutamientoFormateado
    });

  } catch (error) {
    console.error('Error en API reclutamiento-actual:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
