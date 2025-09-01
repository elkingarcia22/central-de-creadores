import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔍 Endpoint de prueba simple de dolores llamado');
  
  try {
    // Solo probar consulta, sin actualizaciones
    console.log('🔍 Probando consulta simple de dolores...');
    const { data: dolores, error: doloresError } = await supabaseServer
      .from('dolores_participantes')
      .select('id, participante_id, estado, titulo, fecha_actualizacion')
      .limit(3);
    
    if (doloresError) {
      console.error('❌ Error consultando dolores:', doloresError);
      return res.status(500).json({ 
        error: 'Error consultando dolores',
        details: doloresError.message,
        code: doloresError.code
      });
    }
    
    console.log('✅ Consulta exitosa, dolores encontrados:', dolores?.length || 0);
    
    return res.status(200).json({
      success: true,
      message: 'Consulta simple exitosa',
      dolores_count: dolores?.length || 0,
      dolores_sample: dolores || []
    });
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return res.status(500).json({ 
      error: 'Error inesperado en consulta simple',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
