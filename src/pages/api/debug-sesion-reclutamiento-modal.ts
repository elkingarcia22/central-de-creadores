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
    console.log('🔍 [DEBUG] Verificando datos de sesiones de reclutamiento para el modal...');
    
    // Obtener algunos reclutamientos con sus datos
    const { data: reclutamientos, error } = await supabase
      .from('reclutamientos')
      .select('*')
      .limit(3);

    if (error) {
      console.error('❌ [DEBUG] Error obteniendo reclutamientos:', error);
      return res.status(500).json({ error: 'Error obteniendo reclutamientos' });
    }

    console.log('📊 [DEBUG] Reclutamientos obtenidos:', reclutamientos?.length || 0);

    // Procesar cada reclutamiento para simular lo que hace la API
    const sesionesFormateadas = reclutamientos?.map(reclutamiento => {
      console.log('🔍 [DEBUG] Procesando reclutamiento:', reclutamiento.id);
      console.log('🔍 [DEBUG] usuarios_libreto:', reclutamiento.usuarios_libreto);
      
      return {
        id: reclutamiento.id,
        titulo: `Sesión de Reclutamiento - ${reclutamiento.id}`,
        investigacion_nombre: 'Investigación de prueba',
        observadores: reclutamiento.usuarios_libreto || [],
        usuarios_libreto: reclutamiento.usuarios_libreto,
        fecha_sesion: reclutamiento.fecha_sesion,
        estado: 'programada'
      };
    }) || [];

    console.log('✅ [DEBUG] Sesiones formateadas:', sesionesFormateadas.length);

    return res.status(200).json({
      sesiones: sesionesFormateadas,
      debug_info: {
        total_reclutamientos: reclutamientos?.length || 0,
        con_usuarios_libreto: sesionesFormateadas.filter(s => s.usuarios_libreto && s.usuarios_libreto.length > 0).length,
        con_observadores: sesionesFormateadas.filter(s => s.observadores && s.observadores.length > 0).length
      }
    });
  } catch (error) {
    console.error('❌ [DEBUG] Error en debug-sesion-reclutamiento-modal:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
