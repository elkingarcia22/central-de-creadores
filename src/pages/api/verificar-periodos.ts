import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔍 Verificando períodos en la base de datos...');
    
    // Intentar consultar la tabla periodo
    const { data: periodos, error } = await supabase
      .from('periodo')
      .select('*')
      .order('etiqueta');

    if (error) {
      console.error('❌ Error consultando tabla periodo:', error);
      return res.status(200).json({
        success: false,
        error: error.message,
        message: 'No se pudo consultar la tabla periodo'
      });
    }

    console.log('✅ Períodos encontrados:', periodos?.length || 0);
    console.log('📊 Datos de períodos:', periodos);

    return res.status(200).json({
      success: true,
      data: periodos || [],
      count: periodos?.length || 0,
      message: 'Períodos obtenidos exitosamente'
    });

  } catch (error: any) {
    console.error('❌ Error inesperado:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error inesperado al verificar períodos'
    });
  }
}
