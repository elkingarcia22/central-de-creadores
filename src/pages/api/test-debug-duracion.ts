import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { duracion_sesion } = req.body;
    
    console.log('🧪 TEST DEBUG DURACIÓN - Datos recibidos:', {
      duracion_sesion,
      duracion_sesion_type: typeof duracion_sesion,
      duracion_sesion_parsed: parseInt(duracion_sesion),
      duracion_sesion_isNaN: isNaN(parseInt(duracion_sesion)),
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: 'Test de debug de duración completado',
      datos_recibidos: {
        duracion_sesion,
        duracion_sesion_type: typeof duracion_sesion
      },
      datos_procesados: {
        duracion_sesion_parsed: parseInt(duracion_sesion),
        duracion_sesion_isNaN: isNaN(parseInt(duracion_sesion))
      }
    });

  } catch (error) {
    console.error('❌ Error en test de debug de duración:', error);
    return res.status(500).json({ 
      error: 'Error en test de debug de duración',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
