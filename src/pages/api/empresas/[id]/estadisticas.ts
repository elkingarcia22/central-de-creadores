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
      .select('id, nombre, rol_empresa_id, fecha_ultima_participacion')
      .eq('empresa_id', id);

    if (errorParticipantes) {
      console.error('❌ Error obteniendo participantes:', errorParticipantes);
      return res.status(500).json({ error: 'Error obteniendo participantes' });
    }

    console.log('📊 Participantes encontrados para la empresa:', participantes?.length || 0);
    if (participantes) {
      participantes.forEach((p, index) => {
        console.log(`  ${index + 1}. ID: ${p.id}, Nombre: ${p.nombre}`);
      });
    }

    // 3. Obtener reclutamientos (finalizados, en progreso y pendientes)
    let reclutamientosFinalizados = [];
    let reclutamientosEnProgreso = [];
    let reclutamientosPendientes = [];
    let ultimaParticipacion = null;
    let investigacionesParticipadas = [];

    if (participantes && participantes.length > 0) {
      const participanteIds = participantes.map(p => p.id);
      
      // Obtener todos los estados relevantes
      const { data: estadosData } = await supabaseServer
        .from('estado_agendamiento_cat')
        .select('id, nombre')
        .in('nombre', ['Finalizado', 'En progreso', 'Pendiente'])
        .order('nombre');
      
      if (estadosData && estadosData.length > 0) {
        const estadoIds = estadosData.map(e => e.id);
        
        // Obtener todos los reclutamientos relevantes
        const { data: reclutamientos, error: errorReclutamientos } = await supabaseServer
          .from('reclutamientos')
          .select('id, investigacion_id, participantes_id, fecha_sesion, duracion_sesion, estado_agendamiento')
          .in('estado_agendamiento', estadoIds)
          .in('participantes_id', participanteIds);

        if (!errorReclutamientos && reclutamientos) {
          // Separar reclutamientos por estado
          const estadoFinalizadoId = estadosData.find(e => e.nombre === 'Finalizado')?.id;
          const estadoEnProgresoId = estadosData.find(e => e.nombre === 'En progreso')?.id;
          const estadoPendienteId = estadosData.find(e => e.nombre === 'Pendiente')?.id;
          
          reclutamientosFinalizados = reclutamientos.filter(r => r.estado_agendamiento === estadoFinalizadoId);
          reclutamientosEnProgreso = reclutamientos.filter(r => r.estado_agendamiento === estadoEnProgresoId);
          reclutamientosPendientes = reclutamientos.filter(r => r.estado_agendamiento === estadoPendienteId);
          
          // Obtener la fecha de la última participación (incluyendo todos los estados)
          if (reclutamientos.length > 0) {
            const reclutamientosOrdenados = reclutamientos.sort((a, b) => 
              new Date(b.fecha_sesion).getTime() - new Date(a.fecha_sesion).getTime()
            );
            ultimaParticipacion = reclutamientosOrdenados[0].fecha_sesion;
          }

          // Obtener investigaciones únicas (incluyendo todos los estados)
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
    const totalReclutamientos = reclutamientosFinalizados.length + reclutamientosEnProgreso.length + reclutamientosPendientes.length;
    const todosLosReclutamientos = [...reclutamientosFinalizados, ...reclutamientosEnProgreso, ...reclutamientosPendientes];
    
    // 5. Calcular total_participaciones por participante
    const participantesConEstadisticas = participantes ? participantes.map(participante => {
      // Contar reclutamientos finalizados por este participante
      const participacionesFinalizadas = reclutamientosFinalizados.filter(r => r.participantes_id === participante.id).length;
      
      // Encontrar la fecha de la última participación
      const reclutamientosParticipante = todosLosReclutamientos.filter(r => r.participantes_id === participante.id);
      const ultimaParticipacion = reclutamientosParticipante.length > 0 
        ? reclutamientosParticipante.sort((a, b) => new Date(b.fecha_sesion).getTime() - new Date(a.fecha_sesion).getTime())[0].fecha_sesion
        : null;
      
      return {
        ...participante,
        total_participaciones: participacionesFinalizadas,
        fecha_ultima_participacion: ultimaParticipacion
      };
    }) : [];
    
    const estadisticas = {
      totalParticipaciones: reclutamientosFinalizados.length, // Solo contar las finalizadas
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
      })),
      // Información adicional por estado
      participacionesFinalizadas: reclutamientosFinalizados.length,
      participacionesEnProgreso: reclutamientosEnProgreso.length,
      participacionesPendientes: reclutamientosPendientes.length
    };

    console.log(`✅ Estadísticas obtenidas para empresa ${id}:`, {
      totalParticipaciones: estadisticas.totalParticipaciones,
      totalParticipantes: estadisticas.totalParticipantes,
      investigacionesParticipadas: estadisticas.investigacionesParticipadas,
      participacionesFinalizadas: estadisticas.participacionesFinalizadas,
      participacionesEnProgreso: estadisticas.participacionesEnProgreso,
      participacionesPendientes: estadisticas.participacionesPendientes
    });

    // Debug: Mostrar detalles de los reclutamientos finalizados
    console.log('🔍 Debug - Reclutamientos finalizados encontrados:', reclutamientosFinalizados.length);
    reclutamientosFinalizados.forEach((r, index) => {
      console.log(`  ${index + 1}. ID: ${r.id}, Fecha: ${r.fecha_sesion}, Participante: ${r.participantes_id}`);
    });

    return res.status(200).json({
      estadisticas,
      participantes: participantesConEstadisticas || []
    });

  } catch (error) {
    console.error('❌ Error en la API de estadísticas:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Función auxiliar para calcular participaciones por mes
function calcularParticipacionesPorMes(reclutamientos: any[]) {
  const participacionesPorMes: { [key: string]: number } = {};
  
  // Agregar participaciones existentes
  reclutamientos.forEach(reclutamiento => {
    if (reclutamiento.fecha_sesion) {
      const fecha = new Date(reclutamiento.fecha_sesion);
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
