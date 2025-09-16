import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔍 [DEBUG API] Verificando observadores en la API...');

    // Consultar directamente la tabla de reclutamientos para ver usuarios_libreto
    const { data: reclutamientos, error } = await supabase
      .from('reclutamientos')
      .select(`
        id,
        titulo,
        usuarios_libreto,
        investigacion_id
      `)
      .not('usuarios_libreto', 'is', null);

    if (error) {
      console.error('❌ [DEBUG API] Error consultando reclutamientos:', error);
      return res.status(500).json({ error: 'Error consultando reclutamientos' });
    }

    console.log('🔍 [DEBUG API] Reclutamientos con usuarios_libreto:', reclutamientos?.length || 0);
    
    if (reclutamientos && reclutamientos.length > 0) {
      console.log('🔍 [DEBUG API] Detalles de reclutamientos con usuarios_libreto:', reclutamientos);
    }

    // Ahora consultar las sesiones de reclutamiento
    const { data: sesiones, error: errorSesiones } = await supabase
      .from('sesiones_reclutamiento')
      .select(`
        id,
        titulo,
        fecha_programada,
        reclutamiento_id,
        reclutamientos!sesiones_reclutamiento_reclutamiento_id_fkey(
          id,
          titulo,
          usuarios_libreto
        )
      `);

    if (errorSesiones) {
      console.error('❌ [DEBUG API] Error consultando sesiones:', errorSesiones);
      return res.status(500).json({ error: 'Error consultando sesiones' });
    }

    console.log('🔍 [DEBUG API] Sesiones de reclutamiento:', sesiones?.length || 0);
    
    // Filtrar sesiones que tienen observadores
    const sesionesConObservadores = sesiones?.filter(s => 
      s.reclutamientos?.usuarios_libreto && 
      s.reclutamientos.usuarios_libreto.length > 0
    );

    console.log('🔍 [DEBUG API] Sesiones con observadores:', sesionesConObservadores?.length || 0);
    
    if (sesionesConObservadores && sesionesConObservadores.length > 0) {
      console.log('🔍 [DEBUG API] Detalles de sesiones con observadores:', sesionesConObservadores.map(s => ({
        id: s.id,
        titulo: s.titulo,
        fecha: s.fecha_programada,
        observadores: s.reclutamientos?.usuarios_libreto?.length || 0
      })));
    }

    return res.status(200).json({
      reclutamientos_con_usuarios_libreto: reclutamientos?.length || 0,
      sesiones_totales: sesiones?.length || 0,
      sesiones_con_observadores: sesionesConObservadores?.length || 0,
      detalles_reclutamientos: reclutamientos,
      detalles_sesiones: sesionesConObservadores
    });

  } catch (error) {
    console.error('❌ [DEBUG API] Error general:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
