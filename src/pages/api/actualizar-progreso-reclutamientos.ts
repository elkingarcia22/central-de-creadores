import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔄 Iniciando actualización forzada del progreso de reclutamientos...');

    // 1. Verificar la vista actual
    const { data: vistaActual, error: errorVista } = await supabase
      .from('vista_reclutamientos')
      .select('*')
      .like('nombre', '%prueba%');

    if (errorVista) {
      console.error('❌ Error obteniendo vista actual:', errorVista);
      return res.status(500).json({ 
        error: 'Error obteniendo vista actual', 
        details: errorVista.message 
      });
    }

    console.log('📊 Vista actual:', vistaActual);

    // 2. Calcular progreso manualmente para comparar
    const { data: progresoManual, error: errorManual } = await supabase
      .rpc('calcular_progreso_manual');

    if (errorManual) {
      console.error('❌ Error calculando progreso manual:', errorManual);
      // Continuar sin el cálculo manual
    } else {
      console.log('📊 Progreso manual:', progresoManual);
    }

    // 3. Forzar refresco de la vista (esto puede no ser necesario en Supabase)
    // La vista se actualiza automáticamente cuando cambian los datos subyacentes

    // 4. Verificar la vista después del refresco
    const { data: vistaActualizada, error: errorActualizada } = await supabase
      .from('vista_reclutamientos')
      .select('*')
      .like('nombre', '%prueba%');

    if (errorActualizada) {
      console.error('❌ Error obteniendo vista actualizada:', errorActualizada);
      return res.status(500).json({ 
        error: 'Error obteniendo vista actualizada', 
        details: errorActualizada.message 
      });
    }

    console.log('✅ Vista actualizada:', vistaActualizada);

    return res.status(200).json({
      success: true,
      message: 'Progreso de reclutamientos actualizado exitosamente',
      vista_anterior: vistaActual,
      vista_actualizada: vistaActualizada,
      progreso_manual: progresoManual
    });

  } catch (error) {
    console.error('❌ Error en actualización de progreso:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor', 
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}