import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { runLLM, validatePolicy, selectProvider } from '@packages/ai-router';
import { supabaseServer } from '../../../api/supabase-server';
import { sanitizePII } from '@packages/ai-router/src/utils/sanitize-pii';

// Schema de validación para el request
const AIRunRequestSchema = z.object({
  tool: z.string(),
  input: z.record(z.any()),
  context: z.object({
    tenantId: z.string(),
    investigationId: z.string().optional(),
    sessionId: z.string().optional(),
    participantId: z.string().optional(),
    catalogs: z.object({
      dolorCategoriaIds: z.array(z.string()).optional(),
      perfilCategoriaIds: z.array(z.string()).optional(),
    }).optional(),
  }),
  policy: z.object({
    allowPaid: z.boolean(),
    preferProvider: z.string().optional(),
    maxLatencyMs: z.number().optional(),
    budgetCents: z.number().optional(),
    region: z.string().optional(),
    capabilities: z.array(z.string()).optional(),
  }),
  idempotency_key: z.string().optional(),
});

// Schema de respuesta para analyze_session
const AnalyzeSessionOutSchema = z.object({
  summary: z.string(),
  insights: z.array(z.object({
    text: z.string(),
    evidence: z.object({
      seg_id: z.string(),
    }),
  })),
  dolores: z.array(z.object({
    categoria_id: z.string(),
    ejemplo: z.string(),
    evidence: z.object({
      seg_id: z.string(),
    }),
  })),
  perfil_sugerido: z.object({
    categoria_perfilamiento: z.string(),
    valor_principal: z.string(),
    razones: z.array(z.string()),
    confidence: z.number().min(0).max(1),
  }).optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🤖 [AI] Endpoint /ai/run llamado');
    
    // Validar request
    const validationResult = AIRunRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      console.error('❌ [AI] Request inválido:', validationResult.error);
      return res.status(400).json({ 
        error: 'Request inválido', 
        details: validationResult.error.issues 
      });
    }

    const { tool, input, context, policy, idempotency_key } = validationResult.data;

    // Verificar flags de habilitación
    const iaEnabled = process.env.IA_ENABLE_EXEC === 'true';
    const analyzeSessionEnabled = process.env.IA_FEATURE_ANALYZE_SESSION === 'true';

    if (!iaEnabled || !analyzeSessionEnabled) {
      console.log('⚠️ [AI] IA deshabilitada o feature no disponible');
      return res.status(503).json({ 
        error: 'IA no disponible',
        iaEnabled,
        analyzeSessionEnabled
      });
    }

    // Validar política
    if (!validatePolicy(policy)) {
      return res.status(400).json({ error: 'Política de IA inválida' });
    }

    // Verificar idempotencia
    if (idempotency_key) {
      const { data: existingRun } = await supabaseServer
        .from('ai_runs')
        .select('*')
        .eq('idempotency_key', idempotency_key)
        .single();

      if (existingRun) {
        console.log('🔄 [AI] Ejecución idempotente encontrada');
        return res.status(200).json({
          status: 'ok',
          result: existingRun.result,
          meta: {
            provider: existingRun.provider,
            model: existingRun.model,
            latencyMs: existingRun.latency_ms,
            costCents: existingRun.cost_cents,
            fromCache: true,
          }
        });
      }
    }

    // Procesar según la herramienta
    if (tool === 'analyze_session') {
      return await handleAnalyzeSession(req, res, input, context, policy, idempotency_key);
    }

    return res.status(400).json({ error: `Herramienta no soportada: ${tool}` });

  } catch (error) {
    console.error('❌ [AI] Error en /ai/run:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

async function handleAnalyzeSession(
  req: NextApiRequest,
  res: NextApiResponse,
  input: any,
  context: any,
  policy: any,
  idempotency_key?: string
) {
  console.log('🔍 [AI] Procesando analyze_session');
  
  const { transcriptId, notesId, language = 'es' } = input;
  
  if (!transcriptId) {
    return res.status(400).json({ error: 'transcriptId es requerido' });
  }

  // Cargar transcripción
  const { data: transcript, error: transcriptError } = await supabaseServer
    .from('transcripciones_sesiones')
    .select('*')
    .eq('id', transcriptId)
    .single();

  if (transcriptError || !transcript) {
    console.error('❌ [AI] Error cargando transcripción:', transcriptError);
    return res.status(404).json({ error: 'Transcripción no encontrada' });
  }

  // Cargar notas manuales si se proporciona
  let notes = '';
  if (notesId) {
    const { data: notesData, error: notesError } = await supabaseServer
      .from('notas_manuales')
      .select('contenido, fecha_creacion')
      .eq('participante_id', context.participantId)
      .order('fecha_creacion', { ascending: true });

    if (!notesError && notesData) {
      notes = notesData.map(n => `[${n.fecha_creacion}] ${n.contenido}`).join('\n');
    }
  }

  // Procesar segmentos de transcripción
  const segmentos = transcript.transcripcion_por_segmentos || [];
  const segmentosFormateados = segmentos.map((seg: any, index: number) => {
    const segId = `seg_${index + 1}`;
    return `[SEG id=${segId} start=${seg.start_ms || 0} end=${seg.end_ms || 0}]\n${seg.text || ''}\n[/SEG]`;
  }).join('\n\n');

  // Sanitizar PII
  const sanitizedTranscript = sanitizePII(segmentosFormateados);
  const sanitizedNotes = sanitizePII(notes);

  // Construir prompt
  const prompt = buildAnalyzeSessionPrompt({
    language,
    dolorCategoriaIds: context.catalogs?.dolorCategoriaIds || [],
    perfilCategoriaIds: context.catalogs?.perfilCategoriaIds || [],
    segmentosFormateados: sanitizedTranscript,
    notes: sanitizedNotes,
  });

  console.log('📝 [AI] Prompt construido, longitud:', prompt.length);

  // Ejecutar IA
  const startTime = Date.now();
  
  try {
    const aiResult = await runLLM({
      tool: 'analyze_session',
      input: { transcriptId, notesId, language },
      context,
      policy,
      prompt,
    });

    const latencyMs = Date.now() - startTime;

    if (!aiResult.ok) {
      console.error('❌ [AI] Error en ejecución de IA:', aiResult.error);
      return res.status(500).json({ 
        error: 'Error en análisis de IA',
        details: aiResult.error
      });
    }

    // Validar respuesta con schema
    const validationResult = AnalyzeSessionOutSchema.safeParse(aiResult.output);
    if (!validationResult.success) {
      console.error('❌ [AI] Respuesta de IA inválida:', validationResult.error);
      return res.status(422).json({ 
        error: 'Respuesta de IA inválida',
        details: validationResult.error.issues
      });
    }

    const result = validationResult.data;

    // Validar categorías
    const categoriaValidation = validateCategories(result, context.catalogs);
    if (!categoriaValidation.valid) {
      console.error('❌ [AI] Categorías inválidas:', categoriaValidation.errors);
      return res.status(422).json({ 
        error: 'Categorías inválidas',
        details: categoriaValidation.errors
      });
    }

    // Resolver evidencias
    const resolvedResult = resolveEvidence(result, segmentos);

    // Persistir en base de datos
    await persistAnalysisResults(context, resolvedResult, aiResult, latencyMs, idempotency_key);

    console.log('✅ [AI] Análisis completado exitosamente');

    return res.status(200).json({
      status: 'ok',
      result: resolvedResult,
      meta: {
        provider: aiResult.provider,
        model: aiResult.model,
        latencyMs,
        costCents: aiResult.costCents,
        fromCache: false,
      }
    });

  } catch (error) {
    console.error('❌ [AI] Error en ejecución:', error);
    return res.status(500).json({ 
      error: 'Error en análisis de IA',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

function buildAnalyzeSessionPrompt(params: {
  language: string;
  dolorCategoriaIds: string[];
  perfilCategoriaIds: string[];
  segmentosFormateados: string;
  notes: string;
}): string {
  const { language, dolorCategoriaIds, perfilCategoriaIds, segmentosFormateados, notes } = params;

  return `
Idioma: ${language}

CATEGORÍAS DOLOR PERMITIDAS (usa solo estos IDs):
${dolorCategoriaIds.map(id => `- ${id}`).join('\n')}

CATEGORÍAS PERFIL PERMITIDAS (usa solo estos valores):
${perfilCategoriaIds.map(cat => `- ${cat}`).join('\n')}

TRANSCRIPCIÓN SEGMENTADA:
${segmentosFormateados}

${notes ? `\nNOTAS MANUALES:\n${notes}` : ''}

Analiza la transcripción y extrae información estructurada según el schema AnalyzeSessionOut.
Devuelve SOLO JSON válido sin texto adicional.
`;
}

function validateCategories(result: any, catalogs: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validar dolores
  if (result.dolores) {
    for (const dolor of result.dolores) {
      if (!catalogs?.dolorCategoriaIds?.includes(dolor.categoria_id)) {
        errors.push(`Categoría de dolor inválida: ${dolor.categoria_id}`);
      }
    }
  }

  // Validar perfil
  if (result.perfil_sugerido) {
    if (!catalogs?.perfilCategoriaIds?.includes(result.perfil_sugerido.categoria_perfilamiento)) {
      errors.push(`Categoría de perfil inválida: ${result.perfil_sugerido.categoria_perfilamiento}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

function resolveEvidence(result: any, segmentos: any[]): any {
  // Crear mapa de segmentos por ID
  const segmentMap = new Map();
  segmentos.forEach((seg, index) => {
    segmentMap.set(`seg_${index + 1}`, seg);
  });

  // Resolver evidencias en insights
  if (result.insights) {
    result.insights = result.insights.map((insight: any) => {
      const seg = segmentMap.get(insight.evidence.seg_id);
      if (seg) {
        insight.evidence = {
          transcriptId: seg.id,
          start_ms: seg.start_ms || 0,
          end_ms: seg.end_ms || 0,
        };
      }
      return insight;
    });
  }

  // Resolver evidencias en dolores
  if (result.dolores) {
    result.dolores = result.dolores.map((dolor: any) => {
      const seg = segmentMap.get(dolor.evidence.seg_id);
      if (seg) {
        dolor.evidence = {
          transcriptId: seg.id,
          start_ms: seg.start_ms || 0,
          end_ms: seg.end_ms || 0,
        };
      }
      return dolor;
    });
  }

  return result;
}

async function persistAnalysisResults(
  context: any,
  result: any,
  aiResult: any,
  latencyMs: number,
  idempotency_key?: string
) {
  // Insertar en ai_runs
  const { error: runError } = await supabaseServer
    .from('ai_runs')
    .insert({
      tool: 'analyze_session',
      input: { transcriptId: context.transcriptId },
      context,
      result,
      provider: aiResult.provider,
      model: aiResult.model,
      latency_ms: latencyMs,
      cost_cents: aiResult.costCents,
      status: 'completed',
      idempotency_key,
    });

  if (runError) {
    console.error('❌ [AI] Error guardando ai_runs:', runError);
  }

  // Insertar insights
  if (result.insights) {
    for (const insight of result.insights) {
      const { error: insightError } = await supabaseServer
        .from('insights')
        .insert({
          tenant_id: context.tenantId,
          entity: 'sesion',
          entity_id: context.sessionId,
          type: 'insight',
          text: insight.text,
          evidence: insight.evidence,
          tags: [],
        });

      if (insightError) {
        console.error('❌ [AI] Error guardando insight:', insightError);
      }
    }
  }

  // Insertar dolores
  if (result.dolores) {
    for (const dolor of result.dolores) {
      const { error: dolorError } = await supabaseServer
        .from('insights')
        .insert({
          tenant_id: context.tenantId,
          entity: 'sesion',
          entity_id: context.sessionId,
          type: 'pain',
          text: dolor.ejemplo,
          evidence: dolor.evidence,
          tags: [dolor.categoria_id],
        });

      if (dolorError) {
        console.error('❌ [AI] Error guardando dolor:', dolorError);
      }
    }
  }

  // Insertar perfil sugerido
  if (result.perfil_sugerido) {
    const { error: perfilError } = await supabaseServer
      .from('perfiles_clientes')
      .insert({
        tenant_id: context.tenantId,
        participant_id: context.participantId,
        categoria_perfilamiento: result.perfil_sugerido.categoria_perfilamiento,
        valor_principal: result.perfil_sugerido.valor_principal,
        razones: result.perfil_sugerido.razones,
        confidence: result.perfil_sugerido.confidence,
        source: 'ai_analysis',
        session_id: context.sessionId,
      });

    if (perfilError) {
      console.error('❌ [AI] Error guardando perfil:', perfilError);
    }
  }
}
