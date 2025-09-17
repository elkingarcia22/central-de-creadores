import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { runLLM, validatePolicy, selectProvider, sanitizePII } from '@packages/ai-router';
import { supabaseServer } from '../../../api/supabase-server';

// Schema de validación para el request
const AIRunRequestSchema = z.object({
  tool: z.string(),
  input: z.record(z.any()),
  context: z.record(z.any()).optional(),
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
    
    // Validar request básico
    const { tool, input, context, policy, idempotency_key } = req.body;
    
    if (!tool || !input) {
      return res.status(400).json({ 
        error: 'Request inválido: tool e input son requeridos'
      });
    }

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
  
  const { sessionId, language = 'es' } = input;
  
  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId es requerido' });
  }

  // 1. Cargar información de la sesión con investigación y libreto
  console.log('📊 [AI] Cargando datos de la sesión...');
  
  const { data: sesion, error: sesionError } = await supabaseServer
    .from('sesiones')
    .select(`
      *,
      investigaciones (
        *,
        libretos_investigacion (*)
      )
    `)
    .eq('id', sessionId)
    .single();

  if (sesionError || !sesion) {
    console.error('❌ [AI] Error cargando sesión:', sesionError);
    return res.status(404).json({ error: 'Sesión no encontrada' });
  }

  // 2. Cargar transcripciones de la sesión
  const { data: transcripciones, error: transcripcionesError } = await supabaseServer
    .from('transcripciones_sesiones')
    .select('*')
    .eq('reclutamiento_id', sessionId)
    .or(`sesion_apoyo_id.eq.${sessionId}`);

  if (transcripcionesError) {
    console.error('❌ [AI] Error cargando transcripciones:', transcripcionesError);
    return res.status(500).json({ error: 'Error cargando transcripciones' });
  }

  // 3. Cargar notas manuales de la sesión
  const { data: notasManuales, error: notasError } = await supabaseServer
    .from('notas_manuales')
    .select('*')
    .eq('sesion_id', sessionId)
    .order('fecha_creacion', { ascending: true });

  if (notasError) {
    console.error('❌ [AI] Error cargando notas manuales:', notasError);
    return res.status(500).json({ error: 'Error cargando notas manuales' });
  }

  // 4. Cargar categorías de dolores
  const { data: categoriasDolores, error: categoriasError } = await supabaseServer
    .from('categorias_dolores')
    .select('id, nombre')
    .eq('activo', true);

  if (categoriasError) {
    console.error('❌ [AI] Error cargando categorías de dolores:', categoriasError);
    return res.status(500).json({ error: 'Error cargando categorías' });
  }

  // 5. Categorías de perfilamientos (valores fijos)
  const categoriasPerfilamientos = [
    'comunicacion',
    'comportamiento', 
    'proveedores',
    'decisiones',
    'cultura'
  ];

  // 6. Procesar transcripciones y segmentos
  let segmentosFormateados = '';
  let allSegments: any[] = [];
  
  if (transcripciones && transcripciones.length > 0) {
    for (const transcript of transcripciones) {
      const segmentos = transcript.transcripcion_por_segmentos || [];
      const formattedSegments = segmentos.map((seg: any, index: number) => {
        const segId = `seg_${allSegments.length + index + 1}`;
        allSegments.push({ ...seg, id: segId, transcriptId: transcript.id });
        return `[SEG id=${segId} start=${seg.start_ms || 0} end=${seg.end_ms || 0}]\n${seg.text || ''}\n[/SEG]`;
      });
      segmentosFormateados += formattedSegments.join('\n\n') + '\n\n';
    }
  }

  // 7. Procesar notas manuales
  const notasFormateadas = notasManuales?.map(n => 
    `[NOTA ${n.fecha_creacion}] ${n.contenido}`
  ).join('\n') || '';

  // 8. Procesar contexto del libreto
  const libreto = sesion.investigaciones?.libretos_investigacion;
  const contextoLibreto = libreto ? `
CONTEXTO DE LA INVESTIGACIÓN:
- Problema/Situación: ${libreto.problema_situacion || 'No especificado'}
- Hipótesis: ${libreto.hipotesis || 'No especificada'}
- Objetivos: ${libreto.objetivos || 'No especificados'}
- Resultado Esperado: ${libreto.resultado_esperado || 'No especificado'}
- Descripción General: ${libreto.descripcion_general || 'No especificada'}
` : '';

  // 9. Sanitizar PII
  const sanitizedTranscript = sanitizePII(segmentosFormateados);
  const sanitizedNotes = sanitizePII(notasFormateadas);
  const sanitizedLibreto = sanitizePII(contextoLibreto);

  // 10. Construir prompt
  const prompt = buildAnalyzeSessionPrompt({
    language,
    dolorCategoriaIds: categoriasDolores?.map(c => c.id) || [],
    perfilCategoriaIds: categoriasPerfilamientos,
    segmentosFormateados: sanitizedTranscript,
    notes: sanitizedNotes,
    contextoLibreto: sanitizedLibreto,
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
    const resolvedResult = resolveEvidence(result, allSegments);

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
  contextoLibreto: string;
}): string {
  const { language, dolorCategoriaIds, perfilCategoriaIds, segmentosFormateados, notes, contextoLibreto } = params;

  return `
Idioma: ${language}

CATEGORÍAS DOLOR PERMITIDAS (usa solo estos IDs):
${dolorCategoriaIds.map(id => `- ${id}`).join('\n')}

CATEGORÍAS PERFIL PERMITIDAS (usa solo estos valores):
${perfilCategoriaIds.map(cat => `- ${cat}`).join('\n')}

${contextoLibreto}

TRANSCRIPCIÓN SEGMENTADA:
${segmentosFormateados}

${notes ? `\nNOTAS MANUALES:\n${notes}` : ''}

Analiza la transcripción y extrae información estructurada según el schema AnalyzeSessionOut.
Considera el contexto de la investigación para entender mejor los objetivos.
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
  const { data: aiRun, error: runError } = await supabaseServer
    .from('ai_runs')
    .insert({
      tenant_id: context.tenantId,
      user_id: context.userId || 'system',
      tool: 'analyze_session',
      provider: aiResult.provider,
      model: aiResult.model,
      latency_ms: latencyMs,
      cost_cents: aiResult.costCents || 0,
      status: 'ok',
      input: { sessionId: context.sessionId },
      result,
      idempotency_key,
    })
    .select()
    .single();

  if (runError) {
    console.error('❌ [AI] Error guardando ai_runs:', runError);
    return;
  }

  // Insertar en ai_insights_sesiones
  const { error: insightsError } = await supabaseServer
    .from('ai_insights_sesiones')
    .insert({
      sesion_id: context.sessionId,
      participante_id: context.participantId,
      ai_run_id: aiRun.id,
      resumen: result.summary,
      insights: result.insights || [],
      dolores_identificados: result.dolores || [],
      perfil_sugerido: result.perfil_sugerido,
      confidence_score: result.perfil_sugerido?.confidence || 0.5,
      modelo_usado: aiResult.model,
      tiempo_analisis_ms: latencyMs,
      estado: 'completado',
    });

  if (insightsError) {
    console.error('❌ [AI] Error guardando ai_insights_sesiones:', insightsError);
  }

  // Insertar dolores en dolores_participantes
  if (result.dolores && result.dolores.length > 0) {
    for (const dolor of result.dolores) {
      const { error: dolorError } = await supabaseServer
        .from('dolores_participantes')
        .insert({
          participante_id: context.participantId,
          categoria_id: dolor.categoria_id,
          titulo: `Dolor identificado por IA: ${dolor.categoria_id}`,
          descripcion: dolor.ejemplo,
          severidad: 'media',
          estado: 'activo',
          sesion_relacionada_id: context.sessionId,
          creado_por: context.userId || null,
        });

      if (dolorError) {
        console.error('❌ [AI] Error guardando dolor:', dolorError);
      }
    }
  }

  // Insertar perfil en perfilamientos_participantes
  if (result.perfil_sugerido) {
    const { error: perfilError } = await supabaseServer
      .from('perfilamientos_participantes')
      .insert({
        participante_id: context.participantId,
        usuario_perfilador_id: context.userId || null,
        categoria_perfilamiento: result.perfil_sugerido.categoria_perfilamiento,
        valor_principal: result.perfil_sugerido.valor_principal,
        observaciones: `Perfil generado por IA. Razones: ${result.perfil_sugerido.razones.join(', ')}`,
        contexto_interaccion: `Análisis automático de sesión ${context.sessionId}`,
        confianza_observacion: Math.round(result.perfil_sugerido.confidence * 5), // Convertir 0-1 a 1-5
        etiquetas: ['ai_generated'],
      });

    if (perfilError) {
      console.error('❌ [AI] Error guardando perfil:', perfilError);
    }
  }
}
