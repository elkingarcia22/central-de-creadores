import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { sessionId } = req.query;

    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'ID de sesión requerido' });
    }

    console.log('🔍 [AI Insights] Obteniendo análisis para sesión:', sessionId);

    // Obtener el análisis más reciente para esta sesión
    const { data: insights, error: insightsError } = await supabaseServer
      .from('ai_insights_sesiones')
      .select(`
        *,
        ai_runs (
          id,
          provider,
          model,
          latency_ms,
          cost_cents,
          created_at
        )
      `)
      .eq('sesion_id', sessionId)
      .eq('estado', 'completado')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (insightsError) {
      if (insightsError.code === 'PGRST116') {
        // No se encontró ningún análisis
        console.log('ℹ️ [AI Insights] No se encontró análisis para sesión:', sessionId);
        return res.status(404).json({ 
          error: 'No se encontró análisis de IA para esta sesión',
          code: 'NO_ANALYSIS_FOUND'
        });
      }
      
      console.error('❌ [AI Insights] Error obteniendo insights:', insightsError);
      return res.status(500).json({ 
        error: 'Error obteniendo análisis de IA',
        details: insightsError.message
      });
    }

    if (!insights) {
      console.log('ℹ️ [AI Insights] No se encontró análisis para sesión:', sessionId);
      return res.status(404).json({ 
        error: 'No se encontró análisis de IA para esta sesión',
        code: 'NO_ANALYSIS_FOUND'
      });
    }

    // Formatear la respuesta
    const result = {
      summary: insights.resumen,
      insights: insights.insights || [],
      dolores: insights.dolores_identificados || [],
      perfil_sugerido: insights.perfil_sugerido
    };

    const meta = {
      provider: insights.ai_runs?.provider || 'unknown',
      model: insights.modelo_usado || insights.ai_runs?.model || 'unknown',
      latencyMs: insights.tiempo_analisis_ms || insights.ai_runs?.latency_ms || 0,
      costCents: insights.ai_runs?.cost_cents || 0,
      fromCache: true, // Siempre es desde cache ya que viene de la BD
      createdAt: insights.created_at,
      aiRunId: insights.ai_run_id
    };

    console.log('✅ [AI Insights] Análisis obtenido exitosamente para sesión:', sessionId);

    return res.status(200).json({
      status: 'ok',
      result,
      meta,
      found: true
    });

  } catch (error) {
    console.error('❌ [AI Insights] Error:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
