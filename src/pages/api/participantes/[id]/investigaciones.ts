import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de participante requerido' });
  }

  try {
    console.log('🔍 Obteniendo investigaciones para participante:', id);

    // Primero obtener el tipo de participante
    let tipoParticipante = '';
    let participanteData = null;

    // Verificar en participantes (externos)
    let { data: participanteExterno, error: errorExterno } = await supabaseServer
      .from('participantes')
      .select('id, tipo')
      .eq('id', id)
      .single();

    console.log('🔍 Búsqueda en participantes:', { data: participanteExterno, error: errorExterno });

    if (participanteExterno) {
      tipoParticipante = 'externo';
      participanteData = participanteExterno;
    } else {
      // Verificar en participantes_internos
      let { data: participanteInterno, error: errorInterno } = await supabaseServer
        .from('participantes_internos')
        .select('id, tipo')
        .eq('id', id)
        .single();

      console.log('🔍 Búsqueda en participantes_internos:', { data: participanteInterno, error: errorInterno });

      if (participanteInterno) {
        tipoParticipante = 'interno';
        participanteData = participanteInterno;
      } else {
        // Verificar en participantes_friend_family
        let { data: participanteFriendFamily, error: errorFriendFamily } = await supabaseServer
          .from('participantes_friend_family')
          .select('id, tipo')
          .eq('id', id)
          .single();

        console.log('🔍 Búsqueda en participantes_friend_family:', { data: participanteFriendFamily, error: errorFriendFamily });

        if (participanteFriendFamily) {
          tipoParticipante = 'friend_family';
          participanteData = participanteFriendFamily;
        }
      }
    }

    if (!participanteData) {
      return res.status(404).json({ error: 'Participante no encontrado' });
    }

    console.log('🔍 Tipo de participante:', tipoParticipante);

    // Obtener datos usando la vista sugerida por el servidor
    console.log('🔍 Consultando vista_estadisticas_participantes para participantes_id:', id);
    
    const { data: estadisticas, error: errorEstadisticas } = await supabaseServer
      .from('vista_estadisticas_participantes')
      .select('*')
      .eq('participante_id', id);

    console.log('🔍 Resultado consulta vista_estadisticas_participantes:', { 
      data: estadisticas?.length || 0, 
      error: errorEstadisticas,
      sample: estadisticas?.[0]
    });

    if (errorEstadisticas) {
      console.error('❌ Error obteniendo estadísticas:', errorEstadisticas);
      return res.status(500).json({ error: 'Error obteniendo estadísticas' });
    }

    // También intentar obtener reclutamientos directamente
    console.log('🔍 Consultando reclutamientos directamente para participantes_id:', id);
    
    const { data: reclutamientos, error: errorReclutamientos } = await supabaseServer
      .from('reclutamientos')
      .select(`
        id,
        investigacion_id,
        participantes_id,
        fecha_sesion,
        duracion_sesion,
        estado_agendamiento,
        estado_agendamiento_cat (
          id,
          nombre
        )
      `)
      .eq('participantes_id', id);

    console.log('🔍 Resultado consulta reclutamientos:', { 
      data: reclutamientos?.length || 0, 
      error: errorReclutamientos,
      sample: reclutamientos?.[0]
    });

    if (errorReclutamientos) {
      console.error('❌ Error obteniendo reclutamientos:', errorReclutamientos);
      return res.status(500).json({ error: 'Error obteniendo reclutamientos' });
    }

    console.log('🔍 Reclutamientos encontrados:', reclutamientos?.length || 0);
    console.log('🔍 Estadísticas encontradas:', estadisticas?.length || 0);

    // Procesar las investigaciones usando la vista de estadísticas
    let investigaciones = [];
    
    if (estadisticas && estadisticas.length > 0) {
      investigaciones = estadisticas.map(est => ({
        id: est.investigacion_id || est.id,
        nombre: est.nombre_investigacion || est.nombre,
        descripcion: est.descripcion_investigacion || est.descripcion,
        estado: est.estado_investigacion || est.estado,
        fecha_inicio: est.fecha_inicio,
        fecha_fin: est.fecha_fin,
        tipo_sesion: est.tipo_sesion,
        riesgo_automatico: est.riesgo_automatico,
        fecha_participacion: est.fecha_sesion || est.fecha_participacion,
        estado_agendamiento: est.estado_agendamiento,
        duracion_sesion: est.duracion_sesion
      }));
    } else if (reclutamientos && reclutamientos.length > 0) {
      // Fallback: usar reclutamientos si la vista no funciona
      investigaciones = reclutamientos.map(r => ({
        id: r.investigacion_id,
        nombre: `Investigación ${r.investigacion_id}`,
        descripcion: 'Descripción no disponible',
        estado: 'activa',
        fecha_inicio: r.fecha_sesion,
        fecha_fin: r.fecha_sesion,
        tipo_sesion: 'remota',
        riesgo_automatico: 'bajo',
        fecha_participacion: r.fecha_sesion,
        estado_agendamiento: r.estado_agendamiento_cat?.nombre || 'Desconocido',
        duracion_sesion: r.duracion_sesion
      }));
    }

    console.log('✅ Investigaciones procesadas:', investigaciones.length);

    // Calcular participaciones por mes
    const participacionesPorMes = calcularParticipacionesPorMes(investigaciones);

    return res.status(200).json({
      investigaciones,
      total: investigaciones.length,
      participacionesPorMes
    });

  } catch (error) {
    console.error('❌ Error en endpoint investigaciones participante:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Función auxiliar para calcular participaciones por mes
function calcularParticipacionesPorMes(investigaciones: any[]) {
  const participacionesPorMes: { [key: string]: number } = {};
  
  // Agregar participaciones existentes
  investigaciones.forEach(investigacion => {
    if (investigacion.fecha_participacion) {
      const fecha = new Date(investigacion.fecha_participacion);
      const mesAnio = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      
      participacionesPorMes[mesAnio] = (participacionesPorMes[mesAnio] || 0) + 1;
    }
  });

  // Agregar los últimos 6 meses incluso si no hay participaciones
  const ahora = new Date();
  for (let i = 5; i >= 0; i--) {
    const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
    const mesAnio = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    
    if (!participacionesPorMes[mesAnio]) {
      participacionesPorMes[mesAnio] = 0;
    }
  }

  return participacionesPorMes;
}
