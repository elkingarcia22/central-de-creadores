import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { 
      sesion_id, 
      participante_id, 
      resumen, 
      insights, 
      dolores_identificados, 
      perfil_sugerido,
      confidence_score,
      modelo_usado,
      tiempo_analisis_ms
    } = req.body;

    // Validar datos requeridos
    if (!sesion_id || !participante_id) {
      return res.status(400).json({ 
        error: 'sesion_id y participante_id son requeridos' 
      });
    }

    console.log('💾 [AI Save] Guardando análisis para sesión:', sesion_id);

    // Preparar datos para insertar
    const insightData = {
      sesion_id,
      participante_id,
      resumen: resumen || '',
      insights: insights || [],
      dolores_identificados: dolores_identificados || [],
      perfil_sugerido: perfil_sugerido || null,
      confidence_score: confidence_score || 0,
      modelo_usado: modelo_usado || 'unknown',
      tiempo_analisis_ms: tiempo_analisis_ms || 0,
      estado: 'completado'
    };

    // Insertar en la base de datos
    const { data, error } = await supabaseServer
      .from('ai_insights_sesiones')
      .insert([insightData])
      .select()
      .single();

    if (error) {
      console.error('❌ [AI Save] Error guardando insights:', error);
      return res.status(500).json({ 
        error: 'Error guardando análisis de IA',
        details: error.message
      });
    }

    console.log('✅ [AI Save] Análisis guardado exitosamente:', data.id);

    return res.status(200).json({
      status: 'ok',
      message: 'Análisis guardado exitosamente',
      data: {
        id: data.id,
        sesion_id: data.sesion_id,
        created_at: data.created_at
      }
    });

  } catch (error) {
    console.error('❌ [AI Save] Error:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
