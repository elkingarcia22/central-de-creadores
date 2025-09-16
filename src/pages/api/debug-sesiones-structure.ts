import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔍 [DEBUG] Verificando estructura de tabla sesiones_reclutamiento...');

    // Consultar la estructura de la tabla sesiones_reclutamiento
    const { data: sesiones, error } = await supabase
      .from('sesiones_reclutamiento')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ [DEBUG] Error consultando sesiones_reclutamiento:', error);
      return res.status(500).json({ error: 'Error consultando sesiones_reclutamiento' });
    }

    console.log('🔍 [DEBUG] Estructura de sesiones_reclutamiento:', sesiones);

    return res.status(200).json({
      sesiones_sample: sesiones,
      columns_found: sesiones && sesiones.length > 0 ? Object.keys(sesiones[0]) : []
    });

  } catch (error) {
    console.error('❌ [DEBUG] Error general:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
