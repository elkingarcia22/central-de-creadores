import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Verificar si hay reclutamientos con responsables asignados
    const { data: reclutamientosConResponsable, error: error1 } = await supabaseServer
      .from('reclutamientos')
      .select('id, investigacion_id, participantes_id, responsable_agendamiento')
      .not('responsable_agendamiento', 'is', null);

    // 2. Ver algunos ejemplos de reclutamientos con responsables
    const { data: ejemplos, error: error2 } = await supabaseServer
      .from('reclutamientos')
      .select(`
        id,
        investigacion_id,
        participantes_id,
        responsable_agendamiento
      `)
      .not('responsable_agendamiento', 'is', null)
      .limit(5);

    // 3. Verificar usuarios disponibles
    const { data: usuarios, error: error3 } = await supabaseServer
      .from('usuarios')
      .select('*')
      .limit(5);

    // 4. Verificar reclutamientos del participante específico
    const { data: reclutamientosParticipante, error: error4 } = await supabaseServer
      .from('reclutamientos')
      .select(`
        id,
        investigacion_id,
        responsable_agendamiento
      `)
      .eq('participantes_id', '9155b800-f786-46d7-9294-bb385434d042');

    // 5. Intentar obtener responsables manualmente
    let responsablesManual = [];
    if (reclutamientosParticipante && reclutamientosParticipante.length > 0) {
      const responsableIds = reclutamientosParticipante
        .map(r => r.responsable_agendamiento)
        .filter(id => id);
      
      if (responsableIds.length > 0) {
        const { data: responsables, error: error5 } = await supabaseServer
          .from('usuarios')
          .select('id, nombre, email')
          .in('id', responsableIds);
        
        responsablesManual = responsables || [];
      }
    }

    return res.status(200).json({
      reclutamientosConResponsable: {
        count: reclutamientosConResponsable?.length || 0,
        error: error1
      },
      ejemplos: {
        data: ejemplos,
        error: error2
      },
      usuarios: {
        data: usuarios,
        error: error3
      },
      reclutamientosParticipante: {
        data: reclutamientosParticipante,
        error: error4
      },
      responsablesManual: {
        data: responsablesManual
      }
    });

  } catch (error) {
    console.error('Error en debug-responsables:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
