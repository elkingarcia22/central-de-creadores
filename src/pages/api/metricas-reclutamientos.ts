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
    
    console.log('🔍 Obteniendo métricas de reclutamientos desde vista...');
    console.log('👤 Usuario ID:', usuarioId, 'Es Admin:', esAdmin, 'Rol:', rol);

    // Construir consulta base usando la vista corregida
    let queryInvestigaciones = supabase
      .from('vista_reclutamientos_completa')
      .select('*');

    // Aplicar filtros de asignación si no es administrador
    if (esAdmin !== 'true' && usuarioId) {
      console.log('🔒 Aplicando filtros de asignación para usuario:', usuarioId, 'con rol:', rol);
      
      // Para el rol agendador, no filtrar por investigaciones ya que verá todos los reclutamientos
      // donde es responsable del agendamiento (se filtrará después)
      if (rol !== 'agendador') {
        // Para investigador y otros roles, filtrar por investigaciones donde son responsables o implementadores
        // Por ahora, no aplicar filtro para evitar errores en la consulta
        console.log('⚠️ Filtro de responsable/implementador deshabilitado temporalmente');
      }
    }

    const { data: investigacionesPorAgendar, error: errorPorAgendar } = await queryInvestigaciones;

    if (errorPorAgendar) {
      console.error('Error obteniendo investigaciones por agendar:', errorPorAgendar);
      return res.status(500).json({ error: 'Error obteniendo investigaciones por agendar' });
    }

    console.log('✅ Investigaciones por agendar obtenidas:', investigacionesPorAgendar?.length || 0);

    // Obtener reclutamientos asignados al usuario para agendamiento (simplificado)
    let reclutamientosAsignados: any[] = [];
    if (usuarioId) {
      console.log('🔍 Buscando reclutamientos asignados para usuario:', usuarioId);
      
      // Consulta simple como en debug-asignaciones-simple
      const { data: asignaciones, error: errorAsignaciones } = await supabase
        .from('reclutamientos')
        .select('id, investigacion_id, participantes_id, estado_agendamiento, reclutador_id, fecha_sesion')
        .eq('reclutador_id', usuarioId);

      if (errorAsignaciones) {
        console.error('❌ Error obteniendo asignaciones:', errorAsignaciones);
      } else {
        console.log('✅ Reclutamientos asignados para agendamiento:', asignaciones?.length || 0);
        console.log('📊 Datos de asignaciones:', asignaciones);
        reclutamientosAsignados = asignaciones || [];
      }
    }
    if (investigacionesPorAgendar && investigacionesPorAgendar.length > 0) {
      console.log('🔍 Detalles de investigaciones por agendar:');
      investigacionesPorAgendar.forEach((inv, index) => {
        console.log(`  ${index + 1}. ${inv.titulo_investigacion} (ID: ${inv.investigacion_id})`);
        console.log(`     - Responsable: ${inv.responsable_nombre}`);
        console.log(`     - Implementador: ${inv.implementador_nombre}`);
        console.log(`     - Tiene libreto: ${inv.tiene_libreto}`);
        console.log(`     - Tiene participantes: ${inv.tiene_participantes}`);
      });
    }

    // La vista ya tiene todos los datos necesarios, solo necesitamos formatear la respuesta
    const investigacionesFormateadas = (investigacionesPorAgendar || []).map(inv => {
      // Calcular riesgo de reclutamiento basado en fecha de inicio
      let riesgo_reclutamiento = 'bajo';
      let riesgo_reclutamiento_color = '#10B981';
      let dias_restantes_inicio = 0;
      
      if (inv.fecha_inicio) {
        const fechaInicio = new Date(inv.fecha_inicio);
        const hoy = new Date();
        dias_restantes_inicio = Math.ceil((fechaInicio.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dias_restantes_inicio < 0) {
          // Fecha ya pasó - mantener como alto
          riesgo_reclutamiento = 'alto';
          riesgo_reclutamiento_color = '#EF4444';
        } else if (dias_restantes_inicio < 7) {
          riesgo_reclutamiento = 'alto';
          riesgo_reclutamiento_color = '#EF4444';
        } else if (dias_restantes_inicio < 14) {
          riesgo_reclutamiento = 'medio';
          riesgo_reclutamiento_color = '#F59E0B';
        } else {
          riesgo_reclutamiento = 'bajo';
          riesgo_reclutamiento_color = '#10B981';
        }
      } else {
        // Sin fecha de inicio - alto
        riesgo_reclutamiento = 'alto';
        riesgo_reclutamiento_color = '#EF4444';
      }

      return {
        reclutamiento_id: inv.reclutamiento_id,
        investigacion_id: inv.investigacion_id,
        investigacion_nombre: inv.titulo_investigacion,
        estado_investigacion: inv.estado_investigacion,
        investigacion_fecha_inicio: inv.fecha_inicio,
        investigacion_fecha_fin: inv.fecha_fin,
        investigacion_riesgo: inv.riesgo_automatico,
        libreto_titulo: inv.titulo_libreto,
        libreto_descripcion: inv.descripcion_libreto,
        libreto_numero_participantes: inv.participantes_requeridos,
        responsable_nombre: inv.responsable_nombre,
        responsable_correo: inv.responsable_email,
        responsable_id: inv.responsable_id, // Agregar ID del responsable
        implementador_nombre: inv.implementador_nombre,
        implementador_correo: inv.implementador_email,
        implementador_id: inv.implementador_id, // Agregar ID del implementador
        estado_reclutamiento_id: inv.estado_reclutamiento_id,
        estado_reclutamiento_nombre: inv.estado_reclutamiento_nombre,
        estado_reclutamiento_color: inv.estado_reclutamiento_color,
        fecha_sesion: inv.fecha_sesion,
        participantes_reclutados: inv.participantes_actuales,
        progreso_reclutamiento: inv.progreso_reclutamiento,
        porcentaje_completitud: inv.progreso_porcentaje,
        riesgo_reclutamiento: riesgo_reclutamiento,
        riesgo_reclutamiento_color: riesgo_reclutamiento_color,
        dias_restantes_inicio: dias_restantes_inicio,
        tiene_libreto: inv.tiene_libreto,
        tiene_participantes: inv.tiene_participantes
      };
    });

    // Filtrar investigaciones según el rol del usuario
    let investigacionesFinales = investigacionesFormateadas;
    
    if ((rol === 'agendador' || rol === 'Agendador') && usuarioId) {
      console.log('📅 Filtrando reclutamientos para agendador');
      
      // Obtener el nombre del usuario actual
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', usuarioId)
        .single();
      
      if (userError) {
        console.error('❌ Error obteniendo datos del usuario:', userError);
      }
      
      const nombreUsuario = userData?.full_name || '';
      
      // Obtener IDs de investigaciones donde el usuario tiene asignaciones
      const investigacionesIdsConAsignaciones = new Set(
        reclutamientosAsignados.map(r => r.investigacion_id)
      );
      
      console.log('🔍 Investigaciones con asignaciones:', Array.from(investigacionesIdsConAsignaciones));
      
      // Filtrar investigaciones para mostrar:
      // 1. Las que tienen asignaciones del agendador
      // 2. Las donde el agendador es responsable o implementador
      investigacionesFinales = investigacionesFormateadas.filter(inv => {
        const tieneAsignacion = investigacionesIdsConAsignaciones.has(inv.investigacion_id);
        const esResponsable = inv.responsable_nombre === nombreUsuario;
        const esImplementador = inv.implementador_nombre === nombreUsuario;
        
        return tieneAsignacion || esResponsable || esImplementador;
      });
      
      console.log('📊 Investigaciones filtradas para agendador:', investigacionesFinales.length);
    } else if ((rol === 'investigador' || rol === 'Investigador') && usuarioId) {
      console.log('🔬 Filtrando reclutamientos para investigador');
      
      // Obtener el nombre del usuario actual
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', usuarioId)
        .single();
      
      if (userError) {
        console.error('❌ Error obteniendo datos del usuario:', userError);
      }
      
      const nombreUsuario = userData?.full_name || '';
      
      // Para investigador, mostrar solo reclutamientos donde es responsable o implementador
      const investigacionesFiltradas = investigacionesFormateadas.filter(inv => {
        const esResponsable = inv.responsable_nombre === nombreUsuario;
        const esImplementador = inv.implementador_nombre === nombreUsuario;
        return esResponsable || esImplementador;
      });
      
      investigacionesFinales = investigacionesFiltradas;
      
      console.log('📊 Investigaciones filtradas para investigador:', investigacionesFinales.length);
    }

    // Calcular métricas
    const total = investigacionesFinales.length;
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

    investigacionesFinales.forEach(inv => {
      // Contar por estado
      switch (inv.estado_reclutamiento_nombre) {
        case 'Pendiente':
          estadosCount.pendientes++;
          break;
        case 'En progreso':
          estadosCount.enProgreso++;
          break;
        case 'Agendada':
          estadosCount.completados++;
          break;
        default:
          estadosCount.pendientes++;
      }

      // Contar por riesgo
      switch (inv.riesgo_reclutamiento) {
        case 'bajo':
          riesgoCount.bajo++;
          break;
        case 'medio':
          riesgoCount.medio++;
          break;
        case 'alto':
          riesgoCount.alto++;
          break;
        default:
          riesgoCount.medio++;
      }
    });

    console.log('✅ Métricas calculadas:', {
      total,
      estadosCount,
      riesgoCount
    });

    // Formatear reclutamientos asignados para agendamiento
    const reclutamientosAsignadosFormateados = await Promise.all(reclutamientosAsignados.map(async (r) => {
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

      // Obtener nombre del estado de agendamiento
      console.log('🔍 Buscando estado de agendamiento:', r.estado_agendamiento);
      const { data: estadoAgendamiento, error: errorEstado } = await supabase
        .from('estado_agendamiento_cat')
        .select('nombre')
        .eq('id', r.estado_agendamiento)
        .single();
      
      if (errorEstado) {
        console.error('❌ Error obteniendo estado de agendamiento:', errorEstado);
      } else {
        console.log('✅ Estado de agendamiento encontrado:', estadoAgendamiento);
      }

              return {
          reclutamiento_id: r.id,
          investigacion_id: r.investigacion_id,
          investigacion_nombre: investigacion?.nombre || 'Sin nombre',
          participante_nombre: participante?.nombre || 'Sin participante',
          estado_agendamiento: r.estado_agendamiento,
          estado_agendamiento_nombre: estadoAgendamiento?.nombre || 'Sin estado',
          estado_agendamiento_color: '#F59E0B', // Color por defecto para "Pendiente de agendamiento"
          fecha_sesion: r.fecha_sesion,
          tipo: 'asignacion_agendamiento'
        };
    }));

    return res.status(200).json({
      investigaciones: investigacionesFinales,
      reclutamientosAsignados: reclutamientosAsignadosFormateados,
      metricas: {
        total,
        estados: estadosCount,
        riesgo: riesgoCount,
        asignacionesAgendamiento: reclutamientosAsignadosFormateados.length
      }
    });

  } catch (error) {
    console.error('❌ Error en métricas de reclutamientos:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
} 