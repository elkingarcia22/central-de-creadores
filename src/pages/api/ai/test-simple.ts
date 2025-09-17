import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🧪 [Test Simple] Probando endpoint simple...');

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

    console.log('✅ [Test Simple] Análisis simulado completado exitosamente');

    return res.status(200).json({
      status: 'ok',
      message: 'Análisis de IA simulado completado exitosamente',
      result: mockAnalysisResult,
      meta: mockMeta,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [Test Simple] Error:', error);
    return res.status(500).json({ 
      error: 'Error en análisis simulado',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
