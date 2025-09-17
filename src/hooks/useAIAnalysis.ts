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
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [meta, setMeta] = useState<AIAnalysisMeta | null>(null);
  const { showError, showSuccess, showWarning } = useToast();

  const analyzeSession = async (sessionId: string, participantId?: string) => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    setResult(null);
    setMeta(null);

    try {
      console.log('🤖 [AI Hook] Iniciando análisis de sesión:', sessionId);
      console.log('🤖 [AI Hook] Payload a enviar:', {
        tool: 'analyze_session',
        input: {
          sessionId,
          language: 'es'
        },
        context: {
          tenantId: 'default-tenant',
          sessionId,
          participantId,
          catalogs: {}
        },
        policy: {
          allowPaid: false,
          preferProvider: 'ollama',
          maxLatencyMs: 60000,
          budgetCents: 0
        },
        idempotency_key: `analyze-${sessionId}-${Date.now()}`
      });

      console.log('📡 [AI Hook] Enviando request a /api/ai/run...');
      
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
      
      console.log('📡 [AI Hook] Response recibida:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      });

      let data;
      try {
        data = await response.json();
        console.log('✅ [AI Hook] JSON parseado exitosamente');
      } catch (jsonError) {
        console.error('❌ [AI Hook] Error parseando JSON:', jsonError);
        const textResponse = await response.text();
        console.error('❌ [AI Hook] Response como texto:', textResponse);
        throw new Error(`Error parseando respuesta del servidor: ${jsonError.message}`);
      }
      
      console.log('🔍 [AI Hook] Response completa:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        data: data
      });
      
      // Log específico del error del servidor
      if (!response.ok && data) {
        console.error('❌ [AI Hook] Error específico del servidor:', {
          error: data.error,
          details: data.details,
          message: data.message
        });
      }

      if (!response.ok) {
        console.error('❌ [AI Hook] Error response:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        throw new Error(data.error || `Error en el análisis de IA (${response.status})`);
      }

      console.log('✅ [AI Hook] Análisis completado:', data);

      setResult(data.result);
      setMeta(data.meta);

      showSuccess('Análisis de IA completado exitosamente');

      return data;

    } catch (error) {
      console.error('❌ [AI Hook] Error en análisis:', error);
      console.error('❌ [AI Hook] Error stack:', error instanceof Error ? error.stack : 'No stack available');
      
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

  const loadExistingAnalysis = async (sessionId: string) => {
    if (isLoading) return;

    setIsLoading(true);
    setResult(null);
    setMeta(null);

    try {
      console.log('🔍 [AI Hook] Cargando análisis existente para sesión:', sessionId);

      const response = await fetch(`/api/ai/insights/${sessionId}`);

      if (response.status === 404) {
        console.log('ℹ️ [AI Hook] No se encontró análisis existente para sesión:', sessionId);
        return null;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error cargando análisis existente');
      }

      const data = await response.json();

      console.log('✅ [AI Hook] Análisis existente cargado:', data);

      setResult(data.result);
      setMeta(data.meta);

      return data;

    } catch (error) {
      console.error('❌ [AI Hook] Error cargando análisis existente:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      if (!errorMessage.includes('No se encontró análisis')) {
        showError(`Error cargando análisis: ${errorMessage}`);
      }

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const saveAnalysis = async (sessionId: string, participanteId: string) => {
    if (!result || !meta) {
      showError('Sin análisis', 'No hay análisis de IA generado para guardar');
      return false;
    }

    try {
      console.log('💾 [AI Hook] Guardando análisis manualmente...');

      const response = await fetch('/api/ai/insights/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sesion_id: sessionId,
          participante_id: participanteId,
          resumen: result.summary,
          insights: result.insights,
          dolores_identificados: result.dolores,
          perfil_sugerido: result.perfil_sugerido,
          confidence_score: meta.confidence_score,
          modelo_usado: meta.model,
          tiempo_analisis_ms: meta.latencyMs
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error guardando análisis');
      }

      const data = await response.json();
      console.log('✅ [AI Hook] Análisis guardado exitosamente:', data);
      showSuccess('Análisis guardado', 'El análisis de IA se ha guardado correctamente en la base de datos');
      return true;

    } catch (error) {
      console.error('❌ [AI Hook] Error guardando análisis:', error);
      showError('Error al guardar', error instanceof Error ? error.message : 'No se pudo guardar el análisis de IA');
      return false;
    }
  };

  const reset = () => {
    setResult(null);
    setMeta(null);
    setIsAnalyzing(false);
    setIsLoading(false);
  };

  return {
    analyzeSession,
    loadExistingAnalysis,
    saveAnalysis,
    isAnalyzing,
    isLoading,
    result,
    meta,
    reset
  };
};
