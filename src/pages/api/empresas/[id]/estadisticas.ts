import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de empresa requerido' });
  }

  try {
    console.log(`🔍 Obteniendo estadísticas para empresa: ${id}`);

    // 1. Verificar que la empresa existe
    const { data: empresa, error: errorEmpresa } = await supabaseServer
      .from('empresas')
      .select('*')
      .eq('id', id)
      .single();

    if (errorEmpresa || !empresa) {
      console.error('❌ Error obteniendo empresa:', errorEmpresa);
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    // 2. Obtener participantes de esta empresa
    const { data: participantes, error: errorParticipantes } = await supabaseServer
      .from('participantes')
      .select('id, nombre, rol_empresa_id, fecha_ultima_participacion, total_participaciones')
      .eq('empresa_id', id);

    if (errorParticipantes) {
      console.error('❌ Error obteniendo participantes:', errorParticipantes);
      return res.status(500).json({ error: 'Error obteniendo participantes' });
    }

    // 3. Obtener reclutamientos finalizados
    let reclutamientosFinalizados = [];
    let ultimaParticipacion = null;
    let investigacionesParticipadas = [];

    if (participantes && participantes.length > 0) {
      const participanteIds = participantes.map(p => p.id);
      
      // Obtener el estado "Finalizado"
      const { data: estadosData } = await supabaseServer
        .from('estado_agendamiento_cat')
        .select('id, nombre')
        .ilike('nombre', '%finalizado%')
        .limit(1);
      
      if (estadosData && estadosData.length > 0) {
        const estadoFinalizadoId = estadosData[0].id;
        
        // Obtener reclutamientos finalizados
        const { data: reclutamientos, error: errorReclutamientos } = await supabaseServer
          .from('reclutamientos')
          .select('id, investigacion_id, participantes_id, fecha_sesion, duracion_sesion')
          .eq('estado_agendamiento', estadoFinalizadoId)
          .in('participantes_id', participanteIds);

        if (!errorReclutamientos && reclutamientos) {
          reclutamientosFinalizados = reclutamientos;
          
          // Obtener la fecha de la última participación
          if (reclutamientos.length > 0) {
            const reclutamientosOrdenados = reclutamientos.sort((a, b) => 
              new Date(b.fecha_sesion).getTime() - new Date(a.fecha_sesion).getTime()
            );
            ultimaParticipacion = reclutamientosOrdenados[0].fecha_sesion;
          }

          // Obtener investigaciones únicas
          const investigacionesIds = [...new Set(reclutamientos.map(r => r.investigacion_id))];
          
          if (investigacionesIds.length > 0) {
            const { data: investigaciones, error: errorInvestigaciones } = await supabaseServer
              .from('investigaciones')
              .select('id, nombre, descripcion, fecha_inicio, fecha_fin, estado, tipo_sesion, riesgo_automatico')
              .in('id', investigacionesIds);

            if (!errorInvestigaciones && investigaciones) {
              investigacionesParticipadas = investigaciones;
            }
          }
        }
      }
    }

    // 4. Calcular estadísticas
    const estadisticas = {
      totalParticipaciones: reclutamientosFinalizados.length,
      totalParticipantes: participantes ? participantes.length : 0,
      fechaUltimaParticipacion: ultimaParticipacion,
      investigacionesParticipadas: investigacionesParticipadas.length,
      duracionTotalSesiones: reclutamientosFinalizados.reduce((total, r) => total + (r.duracion_sesion || 60), 0),
      participacionesPorMes: calcularParticipacionesPorMes(reclutamientosFinalizados),
      investigaciones: investigacionesParticipadas.map(inv => ({
        id: inv.id,
        nombre: inv.nombre,
        descripcion: inv.descripcion,
        fecha_inicio: inv.fecha_inicio,
        fecha_fin: inv.fecha_fin,
        estado: inv.estado,
        tipo_sesion: inv.tipo_sesion,
        riesgo_automatico: inv.riesgo_automatico,
        responsable: null,
        implementador: null,
        participaciones: reclutamientosFinalizados.filter(r => r.investigacion_id === inv.id).length
      }))
    };

    console.log(`✅ Estadísticas obtenidas para empresa ${id}:`, {
      totalParticipaciones: estadisticas.totalParticipaciones,
      totalParticipantes: estadisticas.totalParticipantes,
      investigacionesParticipadas: estadisticas.investigacionesParticipadas
    });

    return res.status(200).json({
      estadisticas,
      participantes: participantes || []
    });

  } catch (error) {
    console.error('❌ Error en la API de estadísticas:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Función auxiliar para calcular participaciones por mes
function calcularParticipacionesPorMes(reclutamientos: any[]) {
  const participacionesPorMes: { [key: string]: number } = {};
  
  reclutamientos.forEach(reclutamiento => {
    if (reclutamiento.fecha_sesion) {
      const fecha = new Date(reclutamiento.fecha_sesion);
      const mesAnio = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      
      participacionesPorMes[mesAnio] = (participacionesPorMes[mesAnio] || 0) + 1;
    }
  });

  return participacionesPorMes;
}
