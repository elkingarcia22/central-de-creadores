import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🧪 [AI Test Analyze] Simulando análisis de sesión...');

    // Datos mock para la prueba
    const mockSessionId = '12345678-1234-1234-1234-123456789012';
    const mockParticipantId = '87654321-4321-4321-4321-210987654321';
    const mockTenantId = 'test-tenant';

    // Simular resultado de análisis
    const mockAnalysisResult = {
      summary: "El participante mostró dificultades significativas con la navegación móvil, especialmente al intentar completar el proceso de pago. Se observaron múltiples intentos fallidos y expresiones de frustración.",
      insights: [
        {
          text: "El botón de pago no es visible en el primer scroll",
          evidence: { seg_id: "seg_1" }
        },
        {
          text: "Confusión con la interfaz de selección de método de pago",
          evidence: { seg_id: "seg_3" }
        }
      ],
      dolores: [
        {
          categoria_id: "678fbae1-010d-45fc-a97a-58d039a107ad", // Funcionales
          ejemplo: "No encuentra el botón de pagar en el móvil",
          evidence: { seg_id: "seg_1" }
        },
        {
          categoria_id: "021cb19e-f46d-4a61-95f6-6e28e67a85b4", // Usabilidad básica
          ejemplo: "Confusión con la interfaz de pago",
          evidence: { seg_id: "seg_3" }
        }
      ],
      perfil_sugerido: {
        categoria_perfilamiento: "comunicacion",
        valor_principal: "directo",
        razones: [
          "Expresa sus frustraciones de manera directa",
          "No usa eufemismos al describir problemas"
        ],
        confidence: 0.8
      }
    };

    // Simular datos de IA
    const mockAIResult = {
      provider: 'ollama',
      model: 'llama3.1:8b',
      costCents: 0,
      ok: true,
      output: mockAnalysisResult
    };

    // 1. Insertar en ai_runs
    const { data: aiRun, error: runError } = await supabaseServer
      .from('ai_runs')
      .insert({
        tenant_id: mockTenantId,
        user_id: 'test-user',
        tool: 'analyze_session',
        provider: mockAIResult.provider,
        model: mockAIResult.model,
        latency_ms: 2500,
        cost_cents: mockAIResult.costCents,
        status: 'ok',
        input: { sessionId: mockSessionId },
        result: mockAnalysisResult,
        idempotency_key: `test-${Date.now()}`,
      })
      .select()
      .single();

    if (runError) {
      console.error('❌ [AI Test Analyze] Error guardando ai_runs:', runError);
      return res.status(500).json({ error: 'Error guardando ai_runs', details: runError });
    }

    // 2. Insertar en ai_insights_sesiones
    const { error: insightsError } = await supabaseServer
      .from('ai_insights_sesiones')
      .insert({
        sesion_id: mockSessionId,
        participante_id: mockParticipantId,
        ai_run_id: aiRun.id,
        resumen: mockAnalysisResult.summary,
        insights: mockAnalysisResult.insights,
        dolores_identificados: mockAnalysisResult.dolores,
        perfil_sugerido: mockAnalysisResult.perfil_sugerido,
        confidence_score: mockAnalysisResult.perfil_sugerido.confidence,
        modelo_usado: mockAIResult.model,
        tiempo_analisis_ms: 2500,
        estado: 'completado',
      });

    if (insightsError) {
      console.error('❌ [AI Test Analyze] Error guardando ai_insights_sesiones:', insightsError);
      return res.status(500).json({ error: 'Error guardando insights', details: insightsError });
    }

    // 3. Insertar dolores en dolores_participantes
    for (const dolor of mockAnalysisResult.dolores) {
      const { error: dolorError } = await supabaseServer
        .from('dolores_participantes')
        .insert({
          participante_id: mockParticipantId,
          categoria_id: dolor.categoria_id,
          titulo: `Dolor identificado por IA: ${dolor.categoria_id}`,
          descripcion: dolor.ejemplo,
          severidad: 'media',
          estado: 'activo',
          sesion_relacionada_id: mockSessionId,
          creado_por: 'test-user',
        });

      if (dolorError) {
        console.error('❌ [AI Test Analyze] Error guardando dolor:', dolorError);
      }
    }

    // 4. Insertar perfil en perfilamientos_participantes
    const { error: perfilError } = await supabaseServer
      .from('perfilamientos_participantes')
      .insert({
        participante_id: mockParticipantId,
        usuario_perfilador_id: 'test-user',
        categoria_perfilamiento: mockAnalysisResult.perfil_sugerido.categoria_perfilamiento,
        valor_principal: mockAnalysisResult.perfil_sugerido.valor_principal,
        observaciones: `Perfil generado por IA. Razones: ${mockAnalysisResult.perfil_sugerido.razones.join(', ')}`,
        contexto_interaccion: `Análisis automático de sesión ${mockSessionId}`,
        confianza_observacion: Math.round(mockAnalysisResult.perfil_sugerido.confidence * 5),
        etiquetas: ['ai_generated', 'test'],
      });

    if (perfilError) {
      console.error('❌ [AI Test Analyze] Error guardando perfil:', perfilError);
    }

    console.log('✅ [AI Test Analyze] Análisis simulado completado exitosamente');

    return res.status(200).json({
      status: 'ok',
      message: 'Análisis simulado completado exitosamente',
      result: mockAnalysisResult,
      meta: {
        provider: mockAIResult.provider,
        model: mockAIResult.model,
        latencyMs: 2500,
        costCents: mockAIResult.costCents,
        fromCache: false,
        testMode: true
      },
      aiRunId: aiRun.id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [AI Test Analyze] Error:', error);
    return res.status(500).json({ 
      error: 'Error en análisis simulado',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
