import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🚀 Iniciando API metricas-reclutamientos-simple');
    console.log('🔧 Variables de entorno:', {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      nodeEnv: process.env.NODE_ENV
    });

    if (!supabase) {
      console.error('❌ Cliente de Supabase no disponible');
      return res.status(500).json({ error: 'Cliente de Supabase no configurado' });
    }

    const { usuarioId, esAdmin, rol } = req.query;
    
    console.log('👤 Parámetros recibidos:', { usuarioId, esAdmin, rol });

    // Consulta simplificada - solo obtener investigaciones básicas
    console.log('🔍 Obteniendo investigaciones básicas...');
    const { data: investigaciones, error: errorInvestigaciones } = await supabase
      .from('investigaciones')
      .select(`
        id,
        nombre,
        estado,
        fecha_inicio,
        fecha_fin,
        responsable_id,
        implementador_id,
        creado_el
      `)
      .in('estado', ['por_agendar', 'por_iniciar', 'en_progreso', 'finalizado']);

    if (errorInvestigaciones) {
      console.error('❌ Error obteniendo investigaciones:', errorInvestigaciones);
      return res.status(500).json({ 
        error: 'Error obteniendo investigaciones',
        details: errorInvestigaciones.message 
      });
    }

    console.log('✅ Investigaciones obtenidas:', investigaciones?.length || 0);

    // Procesar investigaciones de forma simplificada
    const investigacionesProcesadas = await Promise.all((investigaciones || []).map(async (inv) => {
      try {
        // Obtener datos del responsable
        let responsable_nombre = 'Sin asignar';
        if (inv.responsable_id) {
          const { data: responsableData } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', inv.responsable_id)
            .single();
          if (responsableData) {
            responsable_nombre = responsableData.full_name || responsableData.email || 'Sin asignar';
          }
        }

        // Obtener datos del implementador
        let implementador_nombre = 'Sin asignar';
        if (inv.implementador_id) {
          const { data: implementadorData } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', inv.implementador_id)
            .single();
          if (implementadorData) {
            implementador_nombre = implementadorData.full_name || implementadorData.email || 'Sin asignar';
          }
        }

        // Obtener datos del libreto
        const { data: libretoData } = await supabase
          .from('libretos_investigacion')
          .select('problema_situacion, numero_participantes')
          .eq('investigacion_id', inv.id)
          .single();

        // Obtener participantes reclutados (consulta simple)
        const { data: participantesData } = await supabase
          .from('reclutamientos')
          .select('id')
          .eq('investigacion_id', inv.id)
          .not('participantes_id', 'is', null);

        const participantes_reclutados = participantesData?.length || 0;
        const participantes_requeridos = libretoData?.numero_participantes || 0;

        // Calcular progreso
        let progreso_porcentaje = 0;
        let estado_reclutamiento_nombre = 'Pendiente';
        let estado_reclutamiento_color = '#6B7280';

        if (participantes_requeridos > 0) {
          progreso_porcentaje = Math.round((participantes_reclutados / participantes_requeridos) * 100);
          
          if (participantes_reclutados === 0) {
            estado_reclutamiento_nombre = 'Pendiente';
            estado_reclutamiento_color = '#6B7280';
          } else if (participantes_reclutados < participantes_requeridos) {
            estado_reclutamiento_nombre = 'En progreso';
            estado_reclutamiento_color = '#3B82F6';
          } else {
            estado_reclutamiento_nombre = 'Agendada';
            estado_reclutamiento_color = '#10B981';
          }
        }

        // Calcular riesgo basado en fecha
        let riesgo_reclutamiento = 'bajo';
        let riesgo_reclutamiento_color = '#10B981';
        let dias_restantes_inicio = 0;

        if (inv.fecha_inicio) {
          const fechaInicio = new Date(inv.fecha_inicio);
          const hoy = new Date();
          dias_restantes_inicio = Math.ceil((fechaInicio.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
          
          if (dias_restantes_inicio < 0) {
            riesgo_reclutamiento = 'alto';
            riesgo_reclutamiento_color = '#EF4444';
          } else if (dias_restantes_inicio < 7) {
            riesgo_reclutamiento = 'alto';
            riesgo_reclutamiento_color = '#EF4444';
          } else if (dias_restantes_inicio < 14) {
            riesgo_reclutamiento = 'medio';
            riesgo_reclutamiento_color = '#F59E0B';
          }
        } else {
          riesgo_reclutamiento = 'alto';
          riesgo_reclutamiento_color = '#EF4444';
        }

        return {
          reclutamiento_id: inv.id,
          investigacion_id: inv.id,
          investigacion_nombre: inv.nombre,
          estado_investigacion: inv.estado,
          investigacion_fecha_inicio: inv.fecha_inicio,
          investigacion_fecha_fin: inv.fecha_fin,
          investigacion_riesgo: 'bajo',
          libreto_titulo: libretoData?.problema_situacion || 'Sin libreto',
          libreto_descripcion: libretoData?.problema_situacion || 'Sin libreto',
          libreto_numero_participantes: participantes_requeridos,
          responsable_nombre,
          responsable_correo: 'Sin asignar',
          responsable_id: inv.responsable_id,
          implementador_nombre,
          implementador_correo: 'Sin asignar',
          implementador_id: inv.implementador_id,
          estado_reclutamiento_id: null,
          estado_reclutamiento_nombre,
          estado_reclutamiento_color,
          fecha_sesion: null,
          participantes_reclutados,
          progreso_reclutamiento: `${participantes_reclutados}/${participantes_requeridos}`,
          porcentaje_completitud: progreso_porcentaje,
          riesgo_reclutamiento,
          riesgo_reclutamiento_color,
          dias_restantes_inicio,
          tiene_libreto: !!libretoData,
          tiene_participantes: participantes_reclutados > 0
        };
      } catch (error) {
        console.error(`❌ Error procesando investigación ${inv.id}:`, error);
        return null;
      }
    }));

    // Filtrar investigaciones nulas
    const investigacionesValidas = investigacionesProcesadas.filter(inv => inv !== null);

    // Calcular métricas
    const total = investigacionesValidas.length;
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

    investigacionesValidas.forEach(inv => {
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

    console.log('✅ Métricas calculadas:', { total, estadosCount, riesgoCount });

    return res.status(200).json({
      investigaciones: investigacionesValidas,
      reclutamientosAsignados: [], // Simplificado - no incluir asignaciones por ahora
      metricas: {
        total,
        estados: estadosCount,
        riesgo: riesgoCount,
        asignacionesAgendamiento: 0
      }
    });

  } catch (error) {
    console.error('❌ Error en métricas de reclutamientos simple:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
}
