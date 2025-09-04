import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../../api/supabase-server';

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

    // Buscar en todas las tablas de participantes secuencialmente con mejor manejo de errores
    console.log('🔍 Buscando participante en todas las tablas:', id);
    
    // Buscar en participantes (externos)
    const { data: participanteExterno, error: errorExterno } = await supabaseServer
      .from('participantes')
      .select('id, tipo')
      .eq('id', id)
      .single();

    console.log('🔍 Búsqueda en participantes (externos):', { data: participanteExterno, error: errorExterno });

    if (participanteExterno) {
      tipoParticipante = 'externo';
      participanteData = participanteExterno;
    } else {
      // Buscar en participantes_internos
      const { data: participanteInterno, error: errorInterno } = await supabaseServer
        .from('participantes_internos')
        .select('id, tipo')
        .eq('id', id)
        .single();

      console.log('🔍 Búsqueda en participantes_internos:', { data: participanteInterno, error: errorInterno });

      if (participanteInterno) {
        tipoParticipante = 'interno';
        participanteData = participanteInterno;
      } else {
        // Buscar en participantes_friend_family
        const { data: participanteFriendFamily, error: errorFriendFamily } = await supabaseServer
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

    // Obtener reclutamientos según el tipo de participante
    console.log('🔍 Consultando reclutamientos para participante:', id, 'tipo:', tipoParticipante);
    
    let query = supabaseServer
      .from('reclutamientos')
      .select(`
        id,
        investigacion_id,
        participantes_id,
        participantes_internos_id,
        participantes_friend_family_id,
        fecha_sesion,
        duracion_sesion,
        estado_agendamiento,
        reclutador_id,
        estado_agendamiento_cat (
          id,
          nombre
        )
      `);

    // Construir la consulta según el tipo de participante
    if (tipoParticipante === 'externo') {
      query = query.eq('participantes_id', id);
    } else if (tipoParticipante === 'interno') {
      query = query.eq('participantes_internos_id', id);
    } else if (tipoParticipante === 'friend_family') {
      query = query.eq('participantes_friend_family_id', id);
    }

    const { data: reclutamientos, error: errorReclutamientos } = await query;

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

    // Procesar las investigaciones usando reclutamientos como fuente principal
    let investigaciones = [];
    
    // Siempre usar reclutamientos como fuente principal para obtener datos detallados
    if (reclutamientos && reclutamientos.length > 0) {
      console.log('🔍 Procesando investigaciones desde reclutamientos:', reclutamientos.length);
      
      console.log('🔍 === DEBUG RECLUTAMIENTOS ===');
      console.log('🔍 Reclutamientos encontrados:', reclutamientos.map(r => ({
        id: r.id,
        investigacion_id: r.investigacion_id,
        fecha_sesion: r.fecha_sesion,
        duracion_sesion: r.duracion_sesion,
        reclutador_id: r.reclutador_id,
        participantes_id: r.participantes_id,
        estado_agendamiento: r.estado_agendamiento_cat?.nombre
      })));
      
      // Ordenar reclutamientos por fecha más reciente para mostrar la participación actual
      const reclutamientosOrdenados = reclutamientos.sort((a, b) => 
        new Date(b.fecha_sesion).getTime() - new Date(a.fecha_sesion).getTime()
      );
      
      console.log('🔍 === RECLUTAMIENTOS ORDENADOS ===');
      console.log('🔍 Ordenados por fecha:', reclutamientosOrdenados.map(r => ({
        id: r.id,
        fecha_sesion: r.fecha_sesion,
        estado: r.estado_agendamiento_cat?.nombre
      })));
      
      investigaciones = reclutamientosOrdenados.map(r => ({
        id: r.investigacion_id,
        nombre: `Investigación ${r.investigacion_id}`,
        descripcion: 'Descripción no disponible',
        estado: 'activa',
        fecha_inicio: r.fecha_sesion,
        fecha_fin: r.fecha_sesion,
        tipo_sesion: 'remota',
        riesgo_automatico: 'bajo',
        fecha_participacion: r.fecha_sesion, // Esta es la fecha real de participación
        estado_agendamiento: r.estado_agendamiento_cat?.nombre || 'Desconocido',
        duracion_sesion: r.duracion_sesion,
        // Agregar propiedades faltantes para la tabla
        tipo_investigacion: 'Sesión de investigación',
        responsable: 'Cargando...', // Se actualizará con el nombre real
        // Campos adicionales para reclutamiento
        reclutamiento_id: r.id,
        reclutador_id: r.reclutador_id,
        participantes_id: r.participantes_id,
        participantes_internos_id: r.participantes_internos_id,
        participantes_friend_family_id: r.participantes_friend_family_id
      }));

      // Intentar obtener nombres reales de las investigaciones
      try {
        const investigacionIds = reclutamientos.map(r => r.investigacion_id);
        console.log('🔍 Intentando obtener nombres reales para IDs:', investigacionIds);
        
        const { data: investigacionesReales, error: errorInvestigaciones } = await supabaseServer
          .from('investigaciones')
          .select('id, nombre, descripcion, estado, fecha_inicio, fecha_fin, tipo_sesion, riesgo_automatico')
          .in('id', investigacionIds);

        if (investigacionesReales && investigacionesReales.length > 0) {
          console.log('🔍 Nombres reales obtenidos:', investigacionesReales.length);
          
          // Actualizar los nombres con los datos reales
          investigaciones = investigaciones.map(inv => {
            const investigacionReal = investigacionesReales.find(ir => ir.id === inv.id);
            if (investigacionReal) {
              return {
                ...inv,
                nombre: investigacionReal.nombre,
                descripcion: investigacionReal.descripcion || inv.descripcion,
                estado: investigacionReal.estado || inv.estado,
                fecha_inicio: investigacionReal.fecha_inicio || inv.fecha_inicio,
                fecha_fin: investigacionReal.fecha_fin || inv.fecha_fin,
                tipo_sesion: investigacionReal.tipo_sesion || inv.tipo_sesion,
                riesgo_automatico: investigacionReal.riesgo_automatico || inv.riesgo_automatico,
                tipo_investigacion: investigacionReal.tipo_sesion || 'Sesión de investigación'
              };
            }
            return inv;
          });
        } else {
          console.log('⚠️ No se pudieron obtener nombres reales de investigaciones');
        }
      } catch (error) {
        console.log('⚠️ Error obteniendo nombres reales:', error);
        // Continuar con los nombres por defecto si hay error
      }

      // Intentar obtener nombres de los responsables de agendamiento
      try {
        const responsableIds = reclutamientos
          .map(r => r.reclutador_id)
          .filter(id => id); // Filtrar IDs nulos o vacíos
        
        if (responsableIds.length > 0) {
          console.log('🔍 Intentando obtener nombres de responsables para IDs:', responsableIds);
          
          const { data: responsables, error: errorResponsables } = await supabaseServer
            .from('usuarios_con_roles')
            .select('id, full_name, email')
            .in('id', responsableIds);

          if (responsables && responsables.length > 0) {
            console.log('🔍 Nombres de responsables obtenidos:', responsables.length);
            
            // Actualizar los responsables con los nombres reales
            investigaciones = investigaciones.map(inv => {
              const reclutamiento = reclutamientos.find(r => r.investigacion_id === inv.id);
              if (reclutamiento && reclutamiento.reclutador_id) {
                const responsable = responsables.find(resp => resp.id === reclutamiento.reclutador_id);
                if (responsable) {
                  return {
                    ...inv,
                    responsable: responsable.full_name || 'Sin nombre'
                  };
                }
              }
              return inv;
            });
          } else {
            console.log('⚠️ No se pudieron obtener nombres de responsables');
          }
        }
      } catch (error) {
        console.log('⚠️ Error obteniendo nombres de responsables:', error);
        // Continuar con los IDs si hay error
      }
    } else if (estadisticas && estadisticas.length > 0) {
      // Fallback: usar estadísticas si no hay reclutamientos
      console.log('🔍 Usando estadísticas como fallback');
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
        duracion_sesion: est.duracion_sesion,
        // Agregar propiedades faltantes para la tabla
        tipo_investigacion: est.tipo_investigacion || est.tipo_sesion || 'Sesión de investigación',
        responsable: est.responsable || est.creado_por || 'No asignado',
        // Campos adicionales para reclutamiento (si están disponibles)
        reclutamiento_id: est.reclutamiento_id,
        reclutador_id: est.reclutador_id,
        participantes_id: est.participantes_id,
        participantes_internos_id: est.participantes_internos_id,
        participantes_friend_family_id: est.participantes_friend_family_id
      }));
    }

    console.log('✅ Investigaciones procesadas:', investigaciones.length);
    
    // Debug detallado de las investigaciones procesadas
    if (investigaciones.length > 0) {
      console.log('🔍 === DATOS FINALES DEVUELTOS ===');
      console.log('🔍 Primera investigación procesada:', {
        id: investigaciones[0].id,
        nombre: investigaciones[0].nombre,
        fecha_participacion: investigaciones[0].fecha_participacion,
        duracion_sesion: investigaciones[0].duracion_sesion,
        responsable: investigaciones[0].responsable,
        reclutador_id: investigaciones[0].reclutador_id,
        reclutamiento_id: investigaciones[0].reclutamiento_id
      });
      console.log('🔍 Todas las investigaciones:', investigaciones.map(inv => ({
        id: inv.id,
        fecha_participacion: inv.fecha_participacion,
        duracion_sesion: inv.duracion_sesion,
        responsable: inv.responsable,
        reclutador_id: inv.reclutador_id
      })));
    } else {
      console.log('⚠️ WARNING - No se procesaron investigaciones');
    }
    
    // Debug: verificar si hay investigaciones duplicadas
    const investigacionesIds = investigaciones.map(inv => inv.id);
    const idsUnicos = [...new Set(investigacionesIds)];
    console.log('🔍 Debug - IDs únicos vs total:', idsUnicos.length, 'vs', investigaciones.length);
    if (idsUnicos.length !== investigaciones.length) {
      console.log('⚠️ WARNING - Hay investigaciones duplicadas!');
      const duplicados = investigacionesIds.filter((id, index) => investigacionesIds.indexOf(id) !== index);
      console.log('🔍 Debug - IDs duplicados:', duplicados);
      
      // Eliminar duplicados manteniendo solo la primera ocurrencia
      const investigacionesUnicas = investigaciones.filter((inv, index) => 
        investigacionesIds.indexOf(inv.id) === index
      );
      console.log('🔍 Debug - Investigaciones después de eliminar duplicados:', investigacionesUnicas.length);
      investigaciones = investigacionesUnicas;
    }

    // Calcular participaciones por mes
    const participacionesPorMes = calcularParticipacionesPorMes(investigaciones);
    
    console.log('🔍 Debug - Participaciones por mes calculadas:', participacionesPorMes);
    console.log('🔍 Debug - Fechas de participación:', investigaciones.map(inv => ({
      id: inv.id,
      fecha_participacion: inv.fecha_participacion,
      fecha_inicio: inv.fecha_inicio,
      estado_agendamiento: inv.estado_agendamiento
    })));
    
    // Debug específico para participaciones finalizadas
    const participacionesFinalizadas = investigaciones.filter(inv => inv.estado_agendamiento === 'Finalizado');
    console.log('🔍 Debug - Participaciones finalizadas:', participacionesFinalizadas.map(inv => ({
      id: inv.id,
      fecha_participacion: inv.fecha_participacion,
      mes_calculado: inv.fecha_participacion ? new Date(inv.fecha_participacion).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' }) : 'Sin fecha'
    })));
    
    // Debug adicional: verificar las fechas de los reclutamientos originales
    if (reclutamientos && reclutamientos.length > 0) {
      console.log('🔍 Debug - Reclutamientos originales:', reclutamientos.map(r => ({
        id: r.id,
        fecha_sesion: r.fecha_sesion,
        estado_agendamiento: r.estado_agendamiento_cat?.nombre
      })));
    }

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
  
  console.log('🔍 Debug - Iniciando cálculo de participaciones por mes');
  console.log('🔍 Debug - Total investigaciones a procesar:', investigaciones.length);
  
  // Agregar participaciones existentes (solo finalizadas)
  investigaciones.forEach((investigacion, index) => {
    console.log(`🔍 Debug - Procesando investigación ${index + 1}:`, {
      id: investigacion.id,
      fecha_participacion: investigacion.fecha_participacion,
      estado_agendamiento: investigacion.estado_agendamiento,
      esFinalizada: investigacion.estado_agendamiento === 'Finalizado'
    });
    
    if (investigacion.fecha_participacion && investigacion.estado_agendamiento === 'Finalizado') {
      const fecha = new Date(investigacion.fecha_participacion);
      const mesAnio = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      
      console.log(`🔍 Debug - Agregando participación finalizada para mes: ${mesAnio}`);
      participacionesPorMes[mesAnio] = (participacionesPorMes[mesAnio] || 0) + 1;
    }
  });

  console.log('🔍 Debug - Participaciones por mes antes de agregar meses vacíos:', participacionesPorMes);

  // Agregar los últimos 6 meses incluso si no hay participaciones
  const ahora = new Date();
  for (let i = 5; i >= 0; i--) {
    const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
    const mesAnio = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    
    if (!participacionesPorMes[mesAnio]) {
      participacionesPorMes[mesAnio] = 0;
    }
  }

  console.log('🔍 Debug - Participaciones por mes final:', participacionesPorMes);
  return participacionesPorMes;
}
