import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { duracion_sesion, duracion_sesion_type } = req.body;
    
    console.log('🔍 DEBUG DURACIÓN - Datos recibidos:', {
      duracion_sesion,
      duracion_sesion_type,
      duracion_sesion_parsed: parseInt(duracion_sesion),
      duracion_sesion_isNaN: isNaN(parseInt(duracion_sesion))
    });

    // Simular inserción para ver qué se guardaría
    const datosSimulados = {
      duracion_sesion: parseInt(duracion_sesion),
      duracion_sesion_original: duracion_sesion,
      timestamp: new Date().toISOString()
    };

    console.log('📤 DEBUG DURACIÓN - Datos que se insertarían:', datosSimulados);

    return res.status(200).json({
      success: true,
      message: 'Debug de duración completado',
      datos_recibidos: {
        duracion_sesion,
        duracion_sesion_type
      },
      datos_procesados: datosSimulados
    });

  } catch (error) {
    console.error('❌ Error en debug de duración:', error);
    return res.status(500).json({ 
      error: 'Error en debug de duración',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
