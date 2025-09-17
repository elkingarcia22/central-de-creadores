import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';
import { runLLM } from '@packages/ai-router';
import { loadPrompt, validateOutput } from '@packages/prompt-kit';
import { sanitizePII } from '../utils/sanitize';
import { checkBudget, recordCost } from '../services/costs';
import { AnalyzeSessionIn, AnalyzeSessionOut, AIRunResponse } from '../types';

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /ai/run
 * Ejecuta una tarea de IA (stub sin activar)
 */
router.post('/run', async (req, res) => {
  try {
    // Validar payload
    const validatedInput = AnalyzeSessionIn.parse(req.body);
    
    // Verificar si la ejecución está habilitada
    const iaEnabled = process.env.IA_ENABLE_EXEC === 'true';
    
    if (!iaEnabled) {
      // Modo stub: validar, loggear y responder con mock
      console.log('AI execution disabled, returning mock response for:', validatedInput.tool);
      
      // Verificar idempotencia
      const { data: existingRun } = await supabase
        .from('ai_runs')
        .select('*')
        .eq('idempotency_key', validatedInput.idempotency_key)
        .single();
      
      if (existingRun) {
        return res.json({
          status: 'ok',
          result: existingRun.result,
          meta: {
            provider: existingRun.provider,
            model: existingRun.model,
            latencyMs: existingRun.latency_ms,
            costCents: existingRun.cost_cents
          }
        });
      }
      
      // Generar resultado mock
      const mockResult = generateMockResult(validatedInput.tool);
      
      // Validar que el resultado mock pasa el schema Zod
      try {
        AnalyzeSessionOut.parse(mockResult);
        console.log('✅ [AI] Mock result passes Zod validation');
      } catch (error) {
        console.error('❌ [AI] Mock result failed Zod validation:', error);
      }
      
      // Registrar en base de datos
      const { data: aiRun, error } = await supabase
        .from('ai_runs')
        .insert({
          tenant_id: validatedInput.context.tenantId,
          user_id: 'system', // TODO: obtener del contexto de autenticación
          tool: validatedInput.tool,
          provider: 'mock',
          model: 'mock-model',
          latency_ms: 0,
          cost_cents: 0,
          status: 'ok',
          input: validatedInput,
          result: mockResult,
          idempotency_key: validatedInput.idempotency_key
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error saving AI run:', error);
        return res.status(500).json({ error: 'Failed to save AI run' });
      }
      
      return res.json({
        status: 'ok',
        result: mockResult,
        meta: {
          provider: 'mock',
          model: 'mock-model',
          latencyMs: 0,
          costCents: 0
        }
      });
    }
    
    // TODO: Implementar ejecución real cuando IA_ENABLE_EXEC=true
    return res.status(501).json({ error: 'AI execution not implemented yet' });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid input',
        details: error.errors
      });
    }
    
    console.error('Error in /ai/run:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /copilot/act
 * Stub para acciones del copilot (no implementado)
 */
router.post('/copilot/act', async (req, res) => {
  try {
    // Validar payload básico
    const { intent, parameters, context } = req.body;
    
    if (!intent || !parameters || !context) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Siempre devolver 501 - no implementado
    return res.status(501).json({ 
      error: 'not_enabled',
      message: 'Copilot actions not implemented yet'
    });
    
  } catch (error) {
    console.error('Error in /copilot/act:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /webhooks/transcripcion
 * Stub para webhooks de transcripción (no implementado)
 */
router.post('/webhooks/transcripcion', async (req, res) => {
  try {
    // Validar payload básico
    const { sessionId, audioUrl, metadata } = req.body;
    
    if (!sessionId || !audioUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Siempre devolver 202 - aceptado pero no procesado
    return res.status(202).json({ 
      accepted: true,
      message: 'Transcription webhook received but not processed'
    });
    
  } catch (error) {
    console.error('Error in /webhooks/transcripcion:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Genera un resultado mock basado en la herramienta
 */
function generateMockResult(tool: string): any {
  switch (tool) {
    case 'analyze_session':
      return {
        summary: "Participante expresa frustración con navegación móvil y proceso de pago. Menciona dificultades para encontrar botones importantes y completar transacciones.",
        insights: [
          {
            text: "CTA de pago poco visible en primer scroll",
            evidence: { transcriptId: "TR_123", start_ms: 734000, end_ms: 742000 }
          }
        ],
        dolores: [
          {
            categoria_id: "NAV_MOBILE",
            ejemplo: "No encuentro el botón de pago en el móvil",
            evidence: { transcriptId: "TR_123", start_ms: 734000, end_ms: 742000 }
          }
        ],
        perfil_sugerido: {
          categoria_id: "MOVIL_FIRST",
          razones: ["Valora rapidez", "Usa solo celular"],
          confidence: 0.78
        }
      };
    
    default:
      return {
        message: `Mock result for tool: ${tool}`,
        timestamp: new Date().toISOString()
      };
  }
}

export default router;
