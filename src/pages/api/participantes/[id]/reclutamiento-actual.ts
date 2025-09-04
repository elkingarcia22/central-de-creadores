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

  console.log('🔍 API reclutamiento-actual - ID participante:', id);

  try {
    // Buscar directamente en la tabla reclutamientos usando participantes_id
    console.log('🔍 Buscando reclutamiento para participante ID:', id);
    const { data: reclutamientos, error: reclutamientoError } = await supabase
      .from('reclutamientos')
      .select(`
        *,
        investigaciones!inner(
          id,
          nombre,
          descripcion,
          fecha_inicio,
          fecha_fin,
          estado,
          responsable_id,
          implementador_id,
          tipo_investigacion_id
        ),
        usuarios!inner(
          id,
          nombre,
          apellido,
          email
        )
      `)
      .eq('participantes_id', id)
      .order('fecha_asignado', { ascending: false })
      .limit(1);

    if (reclutamientoError) {
      console.error('❌ Error consultando reclutamientos:', reclutamientoError);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (!reclutamientos || reclutamientos.length === 0) {
      console.log('❌ No se encontraron reclutamientos para participante ID:', id);
      return res.status(404).json({ error: 'No se encontraron reclutamientos para este participante' });
    }

    const reclutamiento = reclutamientos[0];
    console.log('✅ Reclutamiento encontrado:', reclutamiento);
    
    // Formatear la respuesta usando la estructura real de la base de datos
    const reclutamientoFormateado = {
      id: reclutamiento.id,
      nombre: reclutamiento.investigaciones?.nombre || 'Sin nombre',
      descripcion: reclutamiento.investigaciones?.descripcion || 'Sin descripción',
      fecha_inicio: reclutamiento.investigaciones?.fecha_inicio || reclutamiento.fecha_sesion,
      fecha_sesion: reclutamiento.fecha_sesion,
      duracion_sesion: reclutamiento.duracion_sesion || 60,
      estado: reclutamiento.investigaciones?.estado || 'Sin estado',
      responsable: reclutamiento.usuarios?.nombre ? 
        `${reclutamiento.usuarios.nombre} ${reclutamiento.usuarios.apellido || ''}`.trim() : 
        'Sin responsable',
      implementador: reclutamiento.usuarios?.nombre ? 
        `${reclutamiento.usuarios.nombre} ${reclutamiento.usuarios.apellido || ''}`.trim() : 
        'Sin implementador',
      tipo_investigacion: reclutamiento.investigaciones?.tipo_investigacion_id || 'Sin tipo',
      fecha_asignado: reclutamiento.fecha_asignado,
      estado_agendamiento: reclutamiento.estado_agendamiento,
      reclutador_id: reclutamiento.reclutador_id,
      creado_por: reclutamiento.creado_por
    };

    return res.status(200).json({
      reclutamiento: reclutamientoFormateado
    });

  } catch (error) {
    console.error('Error en API reclutamiento-actual:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
