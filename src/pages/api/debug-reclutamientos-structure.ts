import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔍 [DEBUG] Verificando estructura de la tabla reclutamientos...');
    
    // Obtener información de la estructura de la tabla
    const { data, error } = await supabase
      .from('reclutamientos')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ [DEBUG] Error obteniendo estructura:', error);
      return res.status(500).json({ error: 'Error obteniendo estructura de la tabla' });
    }

    if (data && data.length > 0) {
      const primerReclutamiento = data[0];
      const campos = Object.keys(primerReclutamiento);
      
      console.log('📊 [DEBUG] Campos encontrados en reclutamientos:', campos);
      console.log('📊 [DEBUG] ¿Tiene campo observadores?', campos.includes('observadores'));
      
      return res.status(200).json({
        estructura: {
          campos: campos,
          tiene_observadores: campos.includes('observadores'),
          primer_reclutamiento: primerReclutamiento
        }
      });
    } else {
      return res.status(200).json({
        estructura: {
          campos: [],
          tiene_observadores: false,
          mensaje: 'No hay reclutamientos en la tabla'
        }
      });
    }
  } catch (error) {
    console.error('❌ [DEBUG] Error en debug-reclutamientos-structure:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
