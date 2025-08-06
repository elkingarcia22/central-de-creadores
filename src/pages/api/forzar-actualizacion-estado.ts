import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { investigacion_id } = req.body;

    if (!investigacion_id) {
      return res.status(400).json({ error: 'investigacion_id es requerido' });
    }

    console.log('🔍 Forzando actualización de estado para investigación:', investigacion_id);

    // 1. Obtener información del reclutamiento asociado a la investigación
    const { data: reclutamientos, error: errorReclutamiento } = await supabase
      .from('reclutamientos')
      .select(`
        id,
        investigacion_id,
        fecha_sesion,
        duracion_sesion,
        participantes_id,
        participantes_internos_id,
        participantes_friend_family_id
      `)
      .eq('investigacion_id', investigacion_id);

    if (errorReclutamiento || !reclutamientos || reclutamientos.length === 0) {
      console.error('Error obteniendo reclutamientos:', errorReclutamiento);
      return res.status(404).json({ error: 'Reclutamientos no encontrados' });
    }

    // Usar el primer reclutamiento encontrado
    const reclutamiento = reclutamientos[0];
    console.log(`Encontrados ${reclutamientos.length} reclutamientos, usando el primero:`, reclutamiento.id);

    // 2. Obtener el estado actual de la investigación
    const { data: investigacion, error: errorInvestigacion } = await supabase
      .from('investigaciones')
      .select('estado_reclutamiento')
      .eq('id', reclutamiento.investigacion_id)
      .single();

    if (errorInvestigacion) {
      console.error('Error obteniendo investigación:', errorInvestigacion);
      return res.status(404).json({ error: 'Investigación no encontrada' });
    }

    // 2. Verificar si tiene participantes
    const tieneParticipantes = 
      reclutamiento.participantes_id !== null ||
      reclutamiento.participantes_internos_id !== null ||
      reclutamiento.participantes_friend_family_id !== null;

    console.log('Tiene participantes:', tieneParticipantes);

    // 2. Obtener IDs de estados
    const { data: estados, error: errorEstados } = await supabase
      .from('estado_agendamiento_cat')
      .select('id, nombre')
      .eq('activo', true);

    if (errorEstados) {
      console.error('Error al obtener estados:', errorEstados);
      return res.status(500).json({ error: 'Error al obtener estados' });
    }

    const estadoIds = {};
    estados.forEach(estado => {
      estadoIds[estado.nombre] = estado.id;
    });

    console.log('IDs de estados disponibles:', estadoIds);

    // 4. Determinar nuevo estado
    let nuevoEstadoId;

    if (!reclutamiento.fecha_sesion) {
      if (tieneParticipantes) {
        nuevoEstadoId = estadoIds['En progreso'];
        console.log('Sin fecha + participantes → En progreso');
      } else {
        nuevoEstadoId = estadoIds['Pendiente'];
        console.log('Sin fecha sin participantes → Pendiente');
      }
    } else {
      const fechaSesion = new Date(reclutamiento.fecha_sesion);
      const duracionMinutos = reclutamiento.duracion_sesion || 60;
      const fechaFin = new Date(fechaSesion.getTime() + (duracionMinutos * 60 * 1000));
      const ahora = new Date();

      if (ahora < fechaSesion) {
        if (tieneParticipantes) {
          nuevoEstadoId = estadoIds['En progreso'];
          console.log('Fecha futura + participantes → En progreso');
        } else {
          nuevoEstadoId = estadoIds['Pendiente'];
          console.log('Fecha futura sin participantes → Pendiente');
        }
      } else if (ahora >= fechaSesion && ahora <= fechaFin) {
        nuevoEstadoId = estadoIds['En progreso'];
        console.log('Sesión en curso → En progreso');
      } else {
        nuevoEstadoId = estadoIds['Agendada'];
        console.log('Sesión pasada → Agendada');
      }
    }

    console.log('Estado actual:', investigacion.estado_reclutamiento);
    console.log('Nuevo estado:', nuevoEstadoId);

    // 5. Actualizar estado en la investigación
    if (investigacion.estado_reclutamiento !== nuevoEstadoId) {
      const { error: errorUpdate } = await supabase
        .from('investigaciones')
        .update({ 
          estado_reclutamiento: nuevoEstadoId
        })
        .eq('id', reclutamiento.investigacion_id);

      if (errorUpdate) {
        console.error('Error actualizando estado:', errorUpdate);
        return res.status(500).json({ error: 'Error actualizando estado' });
      }

      console.log('✅ Estado actualizado exitosamente');
    } else {
      console.log('ℹ️ Estado ya está correcto');
    }

    // 6. Verificar resultado
    const { data: resultado, error: errorResultado } = await supabase
      .from('investigaciones')
      .select(`
        id,
        estado_reclutamiento,
        estado_agendamiento_cat!inner(nombre)
      `)
      .eq('id', reclutamiento.investigacion_id)
      .single();

    return res.status(200).json({
      success: true,
      message: 'Estado actualizado exitosamente',
      investigacion: resultado,
      tieneParticipantes,
      nuevoEstadoId
    });

  } catch (error) {
    console.error('Error en forzar-actualizacion-estado:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 