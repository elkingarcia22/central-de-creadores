import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🧪 [Test Analyze Mock] Simulando análisis de IA...');

    // Datos mock para el análisis
    const mockAnalysisResult = {
      summary: "Esta sesión de usabilidad reveló problemas significativos de discoverabilidad en el producto objetivo, pero también mostró que una vez encontrado, la funcionalidad es bien recibida por los usuarios. El participante experimentó frustración inicial al no poder localizar fácilmente la funcionalidad, sugiriendo mejoras en la navegación principal.",
      insights: [
        {
          text: "Problema de discoverabilidad: el producto objetivo no es fácilmente encontrable desde la página principal",
          evidence: { seg_id: "4" }
        },
        {
          text: "Frustración del usuario al no encontrar la funcionalidad esperada",
          evidence: { seg_id: "10" }
        },
        {
          text: "Valoración positiva de la guía paso a paso una vez encontrada la funcionalidad",
          evidence: { seg_id: "14" }
        }
      ],
      dolores: [
        {
          categoria_id: "NAVIGATION_ISSUES",
          ejemplo: "No encuentra el producto objetivo en la navegación principal",
          evidence: { seg_id: "4" }
        },
        {
          categoria_id: "USER_EXPERIENCE",
          ejemplo: "Frustración al no poder localizar funcionalidad esperada",
          evidence: { seg_id: "10" }
        }
      ],
      perfil_sugerido: {
        categoria_perfilamiento: "TECH_SAVVY",
        valor_principal: "Eficiencia",
        razones: [
          "Busca funcionalidades específicas de manera directa",
          "Valora la claridad en la navegación",
          "Tiene experiencia previa con plataformas similares"
        ],
        confidence: 0.8
      }
    };

    // Simular metadatos del análisis
    const mockMeta = {
      provider: 'ollama',
      model: 'llama3.1:8b',
      latencyMs: 2500,
      costCents: 0,
      fromCache: false
    };

    // Simular persistencia en base de datos
    const mockSessionId = '12345678-1234-1234-1234-123456789001';
    const mockParticipantId = '87654321-4321-4321-4321-210987654321';
    const mockTenantId = 'default-tenant';
    const mockUserId = '33333333-3333-3333-3333-333333333333';

    // Crear ai_run
    const { data: aiRun, error: aiRunError } = await supabaseServer
      .from('ai_runs')
      .insert({
        id: '12345678-1234-1234-1234-123456789999',
        tool: 'analyze_session',
        input: { sessionId: mockSessionId, language: 'es' },
        output: mockAnalysisResult,
        status: 'completed',
        provider: mockMeta.provider,
        model: mockMeta.model,
        latency_ms: mockMeta.latencyMs,
        cost_cents: mockMeta.costCents,
        tenant_id: mockTenantId,
        user_id: mockUserId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (aiRunError) {
      console.error('❌ [Test Analyze Mock] Error creando ai_run:', aiRunError);
      return res.status(500).json({ 
        error: 'Error creando ai_run',
        details: aiRunError
      });
    }

    // Crear ai_insights_sesiones
    const { data: aiInsights, error: aiInsightsError } = await supabaseServer
      .from('ai_insights_sesiones')
      .insert({
        id: '12345678-1234-1234-1234-123456789998',
        sesion_id: mockSessionId,
        participante_id: mockParticipantId,
        ai_run_id: aiRun.id,
        resumen: mockAnalysisResult.summary,
        insights: mockAnalysisResult.insights,
        dolores_identificados: mockAnalysisResult.dolores,
        perfil_sugerido: mockAnalysisResult.perfil_sugerido,
        confidence_score: mockAnalysisResult.perfil_sugerido.confidence,
        modelo_usado: mockMeta.model,
        tiempo_analisis_ms: mockMeta.latencyMs,
        estado: 'completado',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (aiInsightsError) {
      console.error('❌ [Test Analyze Mock] Error creando ai_insights_sesiones:', aiInsightsError);
      return res.status(500).json({ 
        error: 'Error creando ai_insights_sesiones',
        details: aiInsightsError
      });
    }

    console.log('✅ [Test Analyze Mock] Análisis simulado completado exitosamente');

    return res.status(200).json({
      status: 'ok',
      message: 'Análisis de IA simulado completado exitosamente',
      result: mockAnalysisResult,
      meta: mockMeta,
      database: {
        ai_run_id: aiRun.id,
        ai_insights_id: aiInsights.id
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [Test Analyze Mock] Error:', error);
    return res.status(500).json({ 
      error: 'Error en análisis simulado',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
