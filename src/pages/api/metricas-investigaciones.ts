import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Obtener investigaciones
    const { data: investigaciones, error: investigacionesError } = await supabase
      .from('investigaciones')
      .select('id, estado');
    
    if (investigacionesError) {
      return res.status(500).json({ error: 'Error obteniendo investigaciones' });
    }
    
    const totalInvestigaciones = investigaciones?.length || 0;
    const enProgreso = investigaciones?.filter(inv => inv.estado === 'en_progreso').length || 0;
    const finalizadas = investigaciones?.filter(inv => inv.estado === 'finalizado').length || 0;
    
    // Obtener seguimientos
    const { count: totalSeguimientos, error: seguimientosError } = await supabase
      .from('seguimientos_investigacion')
      .select('*', { count: 'exact', head: true });
    
    const response = {
      total: totalInvestigaciones,
      estados: {
        en_borrador: investigaciones?.filter(inv => inv.estado === 'en_borrador').length || 0,
        por_iniciar: investigaciones?.filter(inv => inv.estado === 'por_iniciar').length || 0,
        en_progreso: enProgreso,
        finalizado: finalizadas,
        pausado: investigaciones?.filter(inv => inv.estado === 'pausado').length || 0,
        cancelado: investigaciones?.filter(inv => inv.estado === 'cancelado').length || 0
      },
      seguimientos: {
        total: totalSeguimientos || 0,
        porEstado: {}
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error en API métricas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
} 