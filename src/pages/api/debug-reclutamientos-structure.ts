import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔍 [DEBUG] Verificando estructura de tabla reclutamientos...');

    // Consultar la estructura de la tabla reclutamientos
    const { data: reclutamientos, error } = await supabase
      .from('reclutamientos')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ [DEBUG] Error consultando reclutamientos:', error);
      return res.status(500).json({ error: 'Error consultando reclutamientos' });
    }

    console.log('🔍 [DEBUG] Estructura de reclutamientos:', reclutamientos);

    // También consultar información del esquema
    const { data: schemaInfo, error: schemaError } = await supabase
      .rpc('get_table_columns', { table_name: 'reclutamientos' })
      .catch(() => {
        // Si la función no existe, intentar otra forma
        return { data: null, error: { message: 'Función no disponible' } };
      });

    return res.status(200).json({
      reclutamientos_sample: reclutamientos,
      schema_info: schemaInfo,
      schema_error: schemaError?.message,
      columns_found: reclutamientos && reclutamientos.length > 0 ? Object.keys(reclutamientos[0]) : []
    });

  } catch (error) {
    console.error('❌ [DEBUG] Error general:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
