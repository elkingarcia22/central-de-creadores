import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Función para calcular el riesgo de reclutamiento basado en la fecha de inicio
const calcularRiesgoReclutamiento = (fechaInicio: string): { riesgo: string; color: string; diasRestantes: number } => {
  const hoy = new Date();
  const fechaInicioInvestigacion = new Date(fechaInicio);
  const diasRestantes = Math.ceil((fechaInicioInvestigacion.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

  if (diasRestantes <= 3) {
    return {
      riesgo: 'alto',
      color: '#EF4444', // Rojo
      diasRestantes
    };
  } else if (diasRestantes <= 7) {
    return {
      riesgo: 'medio',
      color: '#F59E0B', // Amarillo/Naranja
      diasRestantes
    };
  } else {
    return {
      riesgo: 'bajo',
      color: '#10B981', // Verde
      diasRestantes
    };
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { usuarioId, esAdmin, rol } = req.query;
    
    console.log('🔍 Obteniendo métricas de reclutamientos...');
    console.log('👤 Usuario ID:', usuarioId, 'Es Admin:', esAdmin, 'Rol:', rol);

    // Construir consulta base para investigaciones
    let queryInvestigaciones = supabase
      .from('investigaciones')
      .select(`
        id,
        nombre,
        estado,
        fecha_inicio,
        fecha_fin,
        riesgo_automatico,
        responsable_id,
        implementador_id,
        producto_id,
        tipo_investigacion_id,
        libreto,
        creado_el,
        creado_por,
        estado_reclutamiento
      `)
      .eq('estado', 'por_agendar');

    // Aplicar filtros de asignación si no es administrador
    if (esAdmin !== 'true' && usuarioId) {
      console.log('🔒 Aplicando filtros de asignación para usuario:', usuarioId, 'con rol:', rol);
      
      // Para el rol agendador, no filtrar por investigaciones ya que verá todos los reclutamientos
      // donde es responsable del agendamiento (se filtrará después)
      if (rol !== 'agendador') {
        // Los investigadores solo ven investigaciones donde son responsables o implementadores, NO como creadores
        queryInvestigaciones = queryInvestigaciones.or(`responsable_id.eq.${usuarioId},implementador_id.eq.${usuarioId}`);
      }
    }

    const { data: investigacionesPorAgendar, error: errorPorAgendar } = await queryInvestigaciones;

    if (errorPorAgendar) {
      console.error('Error obteniendo investigaciones por agendar:', errorPorAgendar);
      return res.status(500).json({ error: 'Error obteniendo investigaciones por agendar' });
    }

    console.log('✅ Investigaciones por agendar obtenidas:', investigacionesPorAgendar?.length || 0);
    if (investigacionesPorAgendar && investigacionesPorAgendar.length > 0) {
      console.log('🔍 Detalles de investigaciones por agendar:');
      investigacionesPorAgendar.forEach((inv, index) => {
        console.log(`  ${index + 1}. ${inv.nombre} (ID: ${inv.id})`);
        console.log(`     - Responsable: ${inv.responsable_id}`);
        console.log(`     - Implementador: ${inv.implementador_id}`);
        console.log(`     - Creado por: ${inv.creado_por}`);
      });
    }

    // Obtener datos adicionales necesarios
    const { data: profiles, error: errorProfiles } = await supabase
      .from('profiles')
      .select('id, full_name, email');

    const { data: libretos, error: errorLibretos } = await supabase
      .from('libretos_investigacion')
      .select('id, nombre_sesion, descripcion_general, numero_participantes, numero_participantes_esperados');

    const { data: productos, error: errorProductos } = await supabase
      .from('productos')
      .select('id, nombre');

    const { data: tiposInvestigacion, error: errorTipos } = await supabase
      .from('tipos_investigacion')
      .select('id, nombre');

    const { data: estados, error: errorEstados } = await supabase
      .from('estado_reclutamiento_cat')
      .select('id, nombre')
      .eq('activo', true);

    // Crear mapas para búsqueda rápida
    const profilesMap = new Map((profiles || []).map(p => [p.id, p]));
    const libretosMap = new Map((libretos || []).map(l => [l.id, l]));
    const productosMap = new Map((productos || []).map(p => [p.id, p]));
    const tiposMap = new Map((tiposInvestigacion || []).map(t => [t.id, t]));
    const estadosMap = new Map((estados || []).map(e => [e.id, e]));

    // Obtener reclutamientos y agrupar por investigacion_id
    let queryReclutamientos = supabase
      .from('reclutamientos')
      .select('id, investigacion_id, estado_agendamiento, responsable_agendamiento');
    
    // Para el rol agendador, filtrar por responsable_agendamiento
    if (rol === 'agendador' && usuarioId) {
      console.log('📅 Filtrando reclutamientos por responsable_agendamiento para agendador');
      queryReclutamientos = queryReclutamientos.eq('responsable_agendamiento', usuarioId);
    }
    
    const { data: reclutamientos, error: errorReclutamientos } = await queryReclutamientos;

    if (errorReclutamientos) {
      console.error('Error obteniendo reclutamientos:', errorReclutamientos);
      return res.status(500).json({ error: 'Error obteniendo reclutamientos' });
    }

    // Obtener los estados de reclutamiento desde la tabla estado_reclutamiento_cat
    const { data: estadosReclutamiento, error: errorEstadosReclutamiento } = await supabase
      .from('estado_reclutamiento_cat')
      .select('id, nombre, color, orden')
      .eq('activo', true)
      .order('orden');

    if (errorEstadosReclutamiento) {
      console.error('Error obteniendo estados de reclutamiento:', errorEstadosReclutamiento);
      return res.status(500).json({ error: 'Error obteniendo estados de reclutamiento' });
    }

    // Crear un mapa de conteo de reclutamientos por investigación
    const reclutamientosMap = new Map();
    const reclutamientosPorInvestigacion = new Map();
    
    (reclutamientos || []).forEach(r => {
      // Solo contar si NO está en estado "Pendiente de agendamiento"
      if (r.estado_agendamiento !== 'd32b84d1-6209-41d9-8108-03588ca1f9b5') {
        const count = reclutamientosMap.get(r.investigacion_id) || 0;
        reclutamientosMap.set(r.investigacion_id, count + 1);
      }
      
      // Agrupar reclutamientos por investigación
      if (!reclutamientosPorInvestigacion.has(r.investigacion_id)) {
        reclutamientosPorInvestigacion.set(r.investigacion_id, []);
      }
      reclutamientosPorInvestigacion.get(r.investigacion_id).push(r);
    });

    // Procesar investigaciones por agendar (automáticas)
    const investigacionesProcesadas = await Promise.all((investigacionesPorAgendar || []).map(async (i) => {
      const libreto = i.libreto ? libretosMap.get(i.libreto) : null;
      const producto = i.producto_id ? productosMap.get(i.producto_id) : null;
      const tipo = i.tipo_investigacion_id ? tiposMap.get(i.tipo_investigacion_id) : null;
      const responsable = i.responsable_id ? profilesMap.get(i.responsable_id) : null;
      const implementador = i.implementador_id ? profilesMap.get(i.implementador_id) : null;

      const riesgoReclutamiento = i.fecha_inicio ? 
        calcularRiesgoReclutamiento(i.fecha_inicio) : 
        { riesgo: 'bajo', color: '#10B981', diasRestantes: 0 };

      // Contar reclutamientos asociados a esta investigación
      const participantesReclutados = reclutamientosMap.get(i.id) || 0;

      // Calcular estado de reclutamiento basándose en el progreso
      let estadoReclutamientoNombre = 'Pendiente';
      let estadoReclutamientoColor = '#F59E0B';
      let estadoReclutamientoId = null;
      
      // Lógica simple: si hay participantes reclutados, el estado es "En progreso"
      // Si se completó el número esperado, es "Agendada"
      if (participantesReclutados > 0) {
        const numeroEsperado = libreto?.numero_participantes || libreto?.numero_participantes_esperados || 0;
        
        if (numeroEsperado > 0 && participantesReclutados >= numeroEsperado) {
          estadoReclutamientoNombre = 'Agendada';
          estadoReclutamientoColor = '#10B981';
        } else {
          estadoReclutamientoNombre = 'En progreso';
          estadoReclutamientoColor = '#3B82F6';
        }
      }

      // Buscar el ID del estado en estado_reclutamiento_cat
      const estadoEncontrado = estadosReclutamiento?.find(e => e.nombre === estadoReclutamientoNombre);
      estadoReclutamientoId = estadoEncontrado?.id || null;

      return {
        reclutamiento_id: null, // No es un reclutamiento manual
        investigacion_id: i.id,
        investigacion_nombre: i.nombre || 'Sin nombre',
        estado_investigacion: i.estado || 'Sin estado',
        investigacion_fecha_inicio: i.fecha_inicio,
        investigacion_fecha_fin: i.fecha_fin,
        investigacion_riesgo: i.riesgo_automatico || 'medio',
        libreto_titulo: libreto?.nombre_sesion || 'Sin libreto',
        libreto_descripcion: libreto?.descripcion_general || '',
        libreto_numero_participantes: libreto?.numero_participantes || libreto?.numero_participantes_esperados || 0,
        responsable_nombre: responsable?.full_name || 'Sin responsable',
        responsable_correo: responsable?.email || '',
        responsable_id: responsable?.id || '',
        implementador_nombre: implementador?.full_name || 'Sin implementador',
        implementador_correo: implementador?.email || '',
        estado_reclutamiento_id: estadoReclutamientoId || '',
        estado_reclutamiento_nombre: estadoReclutamientoNombre,
        estado_reclutamiento_color: estadoReclutamientoColor,
        participantes_reclutados: participantesReclutados,
        progreso_reclutamiento: libreto && (libreto.numero_participantes || libreto.numero_participantes_esperados)
          ? `${participantesReclutados}/${libreto.numero_participantes || libreto.numero_participantes_esperados}`
          : participantesReclutados > 0 
            ? `${participantesReclutados}/?` 
            : '0/0',
        porcentaje_completitud: libreto && (libreto.numero_participantes || libreto.numero_participantes_esperados)
          ? Math.round((participantesReclutados / (libreto.numero_participantes || libreto.numero_participantes_esperados)) * 100)
          : 0,
        tipo_reclutamiento: 'automatico', // Siempre automático para la lista principal
        riesgo_reclutamiento: riesgoReclutamiento.riesgo,
        riesgo_reclutamiento_color: riesgoReclutamiento.color,
        dias_restantes_inicio: riesgoReclutamiento.diasRestantes,
        participante_nombre: 'Sin participante', // No aplica para investigaciones automáticas
        participante_email: '',
        fecha_asignado: i.creado_el,
        fecha_sesion: null
      };
    }));

    // Calcular métricas
    const total = investigacionesProcesadas.length;
    const estadosCount = {
      pendientes: 0,
      enProgreso: 0,
      completados: 0,
      cancelados: 0
    };

    const riesgoCount = {
      bajo: 0,
      medio: 0,
      alto: 0
    };
    
    // Contar por estado
    investigacionesProcesadas.forEach(inv => {
      const estadoNombre = inv.estado_reclutamiento_nombre?.toLowerCase();
      if (estadoNombre?.includes('pendiente') || estadoNombre?.includes('por iniciar')) {
        estadosCount.pendientes++;
      } else if (estadoNombre?.includes('progreso') || estadoNombre?.includes('en curso')) {
        estadosCount.enProgreso++;
      } else if (estadoNombre?.includes('completado') || estadoNombre?.includes('finalizado') || estadoNombre?.includes('completada') || estadoNombre?.includes('agendada')) {
        estadosCount.completados++;
      } else if (estadoNombre?.includes('cancelado')) {
        estadosCount.cancelados++;
      } else {
        // Por defecto, considerar como pendiente
        estadosCount.pendientes++;
      }

      // Contar por riesgo de reclutamiento
      const riesgo = inv.riesgo_reclutamiento?.toLowerCase();
      if (riesgo === 'bajo') {
        riesgoCount.bajo++;
      } else if (riesgo === 'medio') {
        riesgoCount.medio++;
      } else if (riesgo === 'alto') {
        riesgoCount.alto++;
      }
    });

    const totalParticipantesNecesarios = investigacionesProcesadas.reduce((sum, inv) => 
      sum + inv.libreto_numero_participantes, 0
    );

    const totalParticipantesReclutados = investigacionesProcesadas.reduce((sum, inv) => 
      sum + inv.participantes_reclutados, 0
    );

    const promedioCompletitud = total > 0 ? 
      investigacionesProcesadas.reduce((sum, inv) => sum + inv.porcentaje_completitud, 0) / total : 0;

    const response = {
      total,
      estados: estadosCount,
      riesgoReclutamiento: riesgoCount,
      progreso: {
        totalParticipantesNecesarios,
        totalParticipantesReclutados,
        promedioCompletitud: Math.round(promedioCompletitud),
        progresoGeneral: totalParticipantesNecesarios > 0 ? 
          Math.round((totalParticipantesReclutados / totalParticipantesNecesarios) * 100) + '%' : '0%'
      },
      resumen: {
        responsablesUnicos: new Set(investigacionesProcesadas.map(inv => inv.responsable_nombre)).size,
        implementadoresUnicos: new Set(investigacionesProcesadas.map(inv => inv.implementador_nombre)).size,
        libretosUnicos: new Set(investigacionesProcesadas.map(inv => inv.libreto_titulo)).size
      },
      metricasPorMes: [], // Calcular basado en fechas
      investigaciones: investigacionesProcesadas
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error en API métricas de reclutamiento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
} 