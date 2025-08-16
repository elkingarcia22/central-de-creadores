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

  try {
    const { usuarioId } = req.query;
    
    if (!usuarioId) {
      return res.status(400).json({ error: 'ID de usuario requerido' });
    }

    console.log('🔍 Obteniendo asignaciones de agendamiento para usuario:', usuarioId);

    // Obtener reclutamientos donde el usuario es responsable del agendamiento
    const { data: reclutamientos, error: errorReclutamientos } = await supabase
      .from('reclutamientos')
      .select('id, investigacion_id, participantes_id, estado_agendamiento, reclutador_id, fecha_sesion')
      .eq('reclutador_id', usuarioId)
      .order('id', { ascending: false });

    if (errorReclutamientos) {
      console.error('Error obteniendo reclutamientos:', errorReclutamientos);
      return res.status(500).json({ error: 'Error obteniendo asignaciones' });
    }

    console.log('✅ Asignaciones encontradas:', reclutamientos?.length || 0);

    // Cargar datos adicionales para cada asignación
    const asignacionesFormateadas = await Promise.all((reclutamientos || []).map(async (r) => {
      // Obtener nombre de investigación
      const { data: investigacion } = await supabase
        .from('investigaciones')
        .select('nombre, estado')
        .eq('id', r.investigacion_id)
        .single();

      // Obtener nombre de participante
      let participante = null;
      if (r.participantes_id) {
        const { data: participanteData } = await supabase
          .from('participantes')
          .select('nombre')
          .eq('id', r.participantes_id)
          .single();
        participante = participanteData;
      }

      return {
        reclutamiento_id: r.id,
        investigacion_id: r.investigacion_id,
        participante_id: r.participantes_id,
        investigacion_nombre: investigacion?.nombre || 'Sin nombre',
        investigacion_estado: investigacion?.estado || 'Sin estado',
        participante_nombre: participante?.nombre || 'Sin participante',
        participante_email: '',
        participante_telefono: '',
        estado_agendamiento: r.estado_agendamiento,
        fecha_sesion: r.fecha_sesion,
        hora_sesion: null,
        duracion_sesion: null,
        libreto_nombre: 'Sin libreto',
        libreto_participantes: 0,
        libreto_duracion: ''
      };
    }));

    // Calcular métricas
    const total = asignacionesFormateadas.length;
    const estadosCount = {
      pendientes: 0,
      agendadas: 0,
      completadas: 0,
      canceladas: 0
    };

    asignacionesFormateadas.forEach(asignacion => {
      // Contar por estado de agendamiento (excluyendo pendientes de agendamiento de las métricas)
      switch (asignacion.estado_agendamiento) {
        case 'agendada':
          estadosCount.agendadas++;
          break;
        case 'completada':
          estadosCount.completadas++;
          break;
        case 'cancelada':
          estadosCount.canceladas++;
          break;
        case 'd32b84d1-6209-41d9-8108-03588ca1f9b5': // Pendiente de agendamiento - NO cuenta en métricas
        default:
          // No incrementar contadores para pendientes
          break;
      }
    });

    console.log('✅ Métricas de asignaciones calculadas:', {
      total,
      estadosCount
    });

    return res.status(200).json({
      asignaciones: asignacionesFormateadas,
      metricas: {
        total,
        estados: estadosCount
      }
    });

  } catch (error) {
    console.error('❌ Error en mis asignaciones de agendamiento:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
