import { AIProvider, AITask, AIResult } from '../types';

export class OllamaProvider implements AIProvider {
  name = 'ollama';
  capabilities = ['text', 'json'];
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  }

  estimateCost(input: any): number {
    // Ollama es gratis
    return 0;
  }

  async generate(task: AITask): Promise<AIResult> {
    const startTime = Date.now();
    
    try {
      console.log('🦙 [Ollama] Iniciando generación con modelo local');
      
      const model = process.env.IA_LOCAL_MODEL || 'llama3.1:8b';
      
      // Construir el prompt
      const prompt = this.buildPrompt(task);
      
      // Llamar a Ollama API
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: {
            temperature: 0.1, // Baja temperatura para respuestas más determinísticas
            top_p: 0.9,
            max_tokens: 4000,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const latencyMs = Date.now() - startTime;

      // Extraer el JSON de la respuesta
      let output;
      try {
        // Ollama puede devolver texto con JSON embebido
        const responseText = data.response || '';
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          output = JSON.parse(jsonMatch[0]);
        } else {
          // Si no hay JSON, intentar parsear toda la respuesta
          output = JSON.parse(responseText);
        }
      } catch (parseError) {
        console.error('❌ [Ollama] Error parseando respuesta JSON:', parseError);
        throw new Error('Respuesta de Ollama no es JSON válido');
      }

      console.log('✅ [Ollama] Generación completada exitosamente');

      return {
        ok: true,
        provider: 'ollama',
        model,
        latencyMs,
        costCents: 0,
        output,
      };

    } catch (error) {
      const latencyMs = Date.now() - startTime;
      console.error('❌ [Ollama] Error en generación:', error);
      
      return {
        ok: false,
        provider: 'ollama',
        model: process.env.IA_LOCAL_MODEL || 'llama3.1:8b',
        latencyMs,
        costCents: 0,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  private buildPrompt(task: AITask): string {
    if (task.prompt) {
      return task.prompt;
    }

    // Construir prompt básico si no se proporciona uno específico
    return `Eres un asistente de IA especializado en análisis de datos. 
Responde en formato JSON válido según las instrucciones proporcionadas.
${JSON.stringify(task.input, null, 2)}`;
  }

  /**
   * Verifica si Ollama está disponible
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        timeout: 5000,
      });
      
      return response.ok;
    } catch (error) {
      console.warn('⚠️ [Ollama] Health check falló:', error);
      return false;
    }
  }
}
