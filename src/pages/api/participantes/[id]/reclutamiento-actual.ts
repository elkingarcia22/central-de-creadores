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
    
    // Consulta con LEFT JOIN para obtener datos completos (más permisiva)
    const { data: reclutamientos, error: reclutamientoError } = await supabase
      .from('reclutamientos')
      .select(`
        *,
        investigaciones(
          id,
          nombre,
          descripcion,
          fecha_inicio,
          fecha_fin,
          estado,
          responsable_id,
          implementador_id
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
    
    // Obtener datos del responsable e implementador
    let responsableNombre = 'Sin responsable';
    let implementadorNombre = 'Sin implementador';
    
    // Verificar si hay investigaciones antes de consultar usuarios
    if (reclutamiento.investigaciones && Array.isArray(reclutamiento.investigaciones) && reclutamiento.investigaciones.length > 0) {
      const investigacion = reclutamiento.investigaciones[0];
      console.log('🔍 Investigación encontrada:', investigacion);
      
      if (investigacion.responsable_id) {
        const { data: responsableData } = await supabase
          .from('usuarios')
          .select('nombre, apellido')
          .eq('id', investigacion.responsable_id)
          .single();
        
        if (responsableData) {
          responsableNombre = `${responsableData.nombre} ${responsableData.apellido || ''}`.trim();
          console.log('✅ Responsable encontrado:', responsableNombre);
        }
      }
      
      if (investigacion.implementador_id) {
        const { data: implementadorData } = await supabase
          .from('usuarios')
          .select('nombre, apellido')
          .eq('id', investigacion.implementador_id)
          .single();
        
        if (implementadorData) {
          implementadorNombre = `${implementadorData.nombre} ${implementadorData.apellido || ''}`.trim();
          console.log('✅ Implementador encontrado:', implementadorNombre);
        }
      }
    } else {
      console.log('⚠️ No hay investigaciones asociadas al reclutamiento');
    }
    
    // Formatear la respuesta usando los datos reales
    const reclutamientoFormateado = {
      id: reclutamiento.id,
      nombre: reclutamiento.investigaciones?.[0]?.nombre || 'Sin nombre',
      descripcion: reclutamiento.investigaciones?.[0]?.descripcion || 'Sin descripción',
      fecha_inicio: reclutamiento.investigaciones?.[0]?.fecha_inicio || reclutamiento.fecha_sesion,
      fecha_sesion: reclutamiento.fecha_sesion,
      duracion_sesion: reclutamiento.duracion_sesion || 60,
      estado: reclutamiento.investigaciones?.[0]?.estado || 'Sin estado',
      responsable: responsableNombre,
      implementador: implementadorNombre,
      tipo_investigacion: 'Sin tipo', // Por ahora
      fecha_asignado: reclutamiento.fecha_asignado,
      estado_agendamiento: reclutamiento.estado_agendamiento,
      reclutador_id: reclutamiento.reclutador_id,
      creado_por: reclutamiento.creado_por
    };

    console.log('✅ Respuesta formateada:', reclutamientoFormateado);

    return res.status(200).json({
      reclutamiento: reclutamientoFormateado
    });

  } catch (error) {
    console.error('💥 Error en API reclutamiento-actual:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
