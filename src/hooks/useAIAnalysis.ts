import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';

interface AIAnalysisResult {
  summary: string;
  insights: Array<{
    text: string;
    evidence: {
      seg_id: string;
    };
  }>;
  dolores: Array<{
    categoria_id: string;
    ejemplo: string;
    evidence: {
      seg_id: string;
    };
  }>;
  perfil_sugerido?: {
    categoria_perfilamiento: string;
    valor_principal: string;
    razones: string[];
    confidence: number;
  };
}

interface AIAnalysisMeta {
  provider: string;
  model: string;
  latencyMs: number;
  costCents: number;
  fromCache: boolean;
}

export const useAIAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [meta, setMeta] = useState<AIAnalysisMeta | null>(null);
  const { showError, showSuccess, showWarning } = useToast;

  const analyzeSession = async (sessionId: string, participantId?: string) => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    setResult(null);
    setMeta(null);

    try {
      console.log('🤖 [AI Hook] Iniciando análisis de sesión:', sessionId);

      const response = await fetch('/api/ai/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool: 'analyze_session',
          input: {
            sessionId,
            language: 'es'
          },
          context: {
            tenantId: 'default-tenant', // TODO: Obtener del contexto real
            sessionId,
            participantId,
            catalogs: {
              // Se cargarán automáticamente en el backend
            }
          },
          policy: {
            allowPaid: false, // FREE-FIRST strategy
            preferProvider: 'ollama',
            maxLatencyMs: 60000,
            budgetCents: 0
          },
          idempotency_key: `analyze-${sessionId}-${Date.now()}`
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en el análisis de IA');
      }

      console.log('✅ [AI Hook] Análisis completado:', data);

      setResult(data.result);
      setMeta(data.meta);

      showSuccess('Análisis de IA completado exitosamente');

      return data;

    } catch (error) {
      console.error('❌ [AI Hook] Error en análisis:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      if (errorMessage.includes('IA no disponible')) {
        showWarning('La funcionalidad de IA no está disponible en este momento');
      } else if (errorMessage.includes('Sesión no encontrada')) {
        showError('No se encontró la sesión especificada');
      } else if (errorMessage.includes('Categorías inválidas')) {
        showError('Error en las categorías del análisis');
      } else {
        showError(`Error en el análisis: ${errorMessage}`);
      }

      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setResult(null);
    setMeta(null);
    setIsAnalyzing(false);
  };

  return {
    analyzeSession,
    isAnalyzing,
    result,
    meta,
    reset
  };
};
