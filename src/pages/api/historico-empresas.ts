import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { empresa_id } = req.query;

      if (!empresa_id) {
        return res.status(400).json({ error: 'empresa_id es requerido' });
      }

      console.log('🔍 Obteniendo historial de empresa:', empresa_id);

      // Obtener historial de participación de la empresa
      const { data: historial, error: errorHistorial } = await supabase
        .from('historial_participacion_empresas')
        .select(`
          id,
          fecha_participacion,
          duracion_sesion,
          estado_sesion,
          rol_participante,
          departamento_participante,
          tipo_investigacion,
          producto_evaluado,
          satisfaccion_participante,
          calidad_feedback,
          insights_obtenidos,
          seguimiento_requerido,
          fecha_seguimiento,
          notas_seguimiento,
          created_at,
          updated_at,
          investigacion:investigaciones(id, nombre, descripcion, estado),
          participante:participantes(id, nombre, descripcion),
          reclutamiento:reclutamientos(id, fecha_sesion, duracion_sesion),
          creado_por:usuarios(id, nombre, correo)
        `)
        .eq('empresa_id', empresa_id)
        .order('fecha_participacion', { ascending: false });

      if (errorHistorial) {
        console.error('Error obteniendo historial:', errorHistorial);
        return res.status(500).json({ error: 'Error obteniendo historial de empresa' });
      }

      // Formatear los datos para el frontend
      const historialFormateado = historial?.map(registro => ({
        id: registro.id,
        fecha_participacion: registro.fecha_participacion,
        duracion_sesion: registro.duracion_sesion,
        estado_sesion: registro.estado_sesion,
        rol_participante: registro.rol_participante || 'Sin rol especificado',
        departamento_participante: registro.departamento_participante || 'Sin departamento',
        tipo_investigacion: registro.tipo_investigacion || 'Sin tipo especificado',
        producto_evaluado: registro.producto_evaluado || 'Sin producto especificado',
        satisfaccion_participante: registro.satisfaccion_participante,
        calidad_feedback: registro.calidad_feedback || 'Sin feedback registrado',
        insights_obtenidos: registro.insights_obtenidos || 'Sin insights registrados',
        seguimiento_requerido: registro.seguimiento_requerido || false,
        fecha_seguimiento: registro.fecha_seguimiento,
        notas_seguimiento: registro.notas_seguimiento || 'Sin notas de seguimiento',
        created_at: registro.created_at,
        updated_at: registro.updated_at,
        
        // Información de la investigación
        investigacion: {
          id: registro.investigacion?.[0]?.id,
          nombre: registro.investigacion?.[0]?.nombre || 'Investigación no encontrada',
          descripcion: registro.investigacion?.[0]?.descripcion,
          estado: registro.investigacion?.[0]?.estado
        },
        
        // Información del participante
        participante: {
          id: registro.participante?.[0]?.id,
          nombre: registro.participante?.[0]?.nombre || 'Participante no encontrado',
          descripcion: registro.participante?.[0]?.descripcion
        },
        
        // Información del reclutamiento
        reclutamiento: {
          id: registro.reclutamiento?.[0]?.id,
          fecha_sesion: registro.reclutamiento?.[0]?.fecha_sesion,
          duracion_sesion: registro.reclutamiento?.[0]?.duracion_sesion
        },
        
        // Información del creador
        creado_por: {
          id: registro.creado_por?.[0]?.id,
          nombre: registro.creado_por?.[0]?.nombre || 'Usuario no encontrado',
          correo: registro.creado_por?.[0]?.correo
        }
      })) || [];

      // Calcular estadísticas
      const estadisticas = {
        total_participaciones: historialFormateado.length,
        participaciones_ultimo_mes: historialFormateado.filter(h => {
          const fecha = new Date(h.fecha_participacion);
          const haceUnMes = new Date();
          haceUnMes.setMonth(haceUnMes.getMonth() - 1);
          return fecha >= haceUnMes;
        }).length,
        promedio_satisfaccion: historialFormateado
          .filter(h => h.satisfaccion_participante)
          .reduce((acc, h) => acc + h.satisfaccion_participante, 0) / 
          historialFormateado.filter(h => h.satisfaccion_participante).length || 0,
        seguimientos_pendientes: historialFormateado.filter(h => h.seguimiento_requerido).length,
        tipos_investigacion: [...new Set(historialFormateado.map(h => h.tipo_investigacion))],
        productos_evaluados: [...new Set(historialFormateado.map(h => h.producto_evaluado))]
      };

      console.log(`✅ Historial obtenido: ${historialFormateado.length} registros`);

      res.status(200).json({
        historial: historialFormateado,
        estadisticas,
        empresa_id
      });

    } catch (error) {
      console.error('Error en GET /api/historico-empresas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
} 