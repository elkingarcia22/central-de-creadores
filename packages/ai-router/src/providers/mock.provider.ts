import { AIProvider, AITask, AIResult } from '../types';

export class MockProvider implements AIProvider {
  name = 'mock';
  capabilities = ['text', 'json'];

  estimateCost(input: any): number {
    // Mock siempre es gratis
    return 0;
  }

  async generate(task: AITask): Promise<AIResult> {
    // Simular latencia
    const latency = Math.floor(Math.random() * 2000) + 500; // 500-2500ms
    
    // Generar resultado mock determinista basado en la herramienta
    const mockOutput = this.generateMockOutput(task.tool);
    
    return {
      ok: true,
      provider: 'mock',
      model: 'mock-model',
      latencyMs: latency,
      costCents: 0,
      output: mockOutput
    };
  }

  private generateMockOutput(tool: string): any {
    switch (tool) {
      case 'analyze_session':
        return {
          summary: "Participante expresa frustración con navegación móvil y proceso de pago. Menciona dificultades para encontrar botones importantes y completar transacciones.",
          insights: [
            {
              text: "CTA de pago poco visible en primer scroll",
              evidence: { transcriptId: "TR_123", start_ms: 734000, end_ms: 742000 }
            },
            {
              text: "Confusión con iconografía de navegación",
              evidence: { transcriptId: "TR_123", start_ms: 120000, end_ms: 135000 }
            }
          ],
          dolores: [
            {
              categoria_id: "NAV_MOBILE",
              ejemplo: "No encuentro el botón de pago en el móvil",
              evidence: { transcriptId: "TR_123", start_ms: 734000, end_ms: 742000 }
            },
            {
              categoria_id: "TRUST",
              ejemplo: "No me siento seguro ingresando mis datos",
              evidence: { transcriptId: "TR_123", start_ms: 800000, end_ms: 820000 }
            }
          ],
          perfil_sugerido: {
            categoria_id: "MOVIL_FIRST",
            razones: ["Valora rapidez", "Usa solo celular", "Prefiere interfaces simples"],
            confidence: 0.78
          }
        };
      
      case 'summarize_investigation':
        return {
          summary: "Investigación sobre experiencia móvil revela 3 dolores principales: navegación, confianza y onboarding.",
          key_findings: [
            "85% de usuarios reportan dificultades de navegación",
            "60% mencionan problemas de confianza",
            "40% abandonan en proceso de onboarding"
          ],
          recommendations: [
            "Simplificar navegación móvil",
            "Mejorar indicadores de seguridad",
            "Optimizar flujo de onboarding"
          ]
        };
      
      case 'generate_profile':
        return {
          perfil_key: "MOVIL_FIRST",
          criterios: {
            device_usage: "mobile_primary",
            tech_savviness: "medium",
            price_sensitivity: "high"
          },
          descripcion: "Usuario que prioriza la experiencia móvil y valora la simplicidad",
          ejemplos: [
            "Prefiere apps sobre web",
            "Valora velocidad de carga",
            "Busca interfaces intuitivas"
          ]
        };
      
      default:
        return {
          message: `Mock output for tool: ${tool}`,
          timestamp: new Date().toISOString()
        };
    }
  }
}
