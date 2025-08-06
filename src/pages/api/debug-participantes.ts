import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { reclutamiento_id } = req.query;
    
    console.log('🔍 Debug para reclutamiento:', reclutamiento_id);
    
    // 1. Verificar el reclutamiento
    const { data: reclutamiento, error: errorReclutamiento } = await supabaseServer
      .from('reclutamientos')
      .select('*')
      .eq('id', reclutamiento_id)
      .single();
      
    console.log('📋 Reclutamiento:', reclutamiento);
    console.log('❌ Error reclutamiento:', errorReclutamiento);
    
    if (!reclutamiento) {
      return res.status(404).json({ error: 'Reclutamiento no encontrado' });
    }
    
    // 2. Verificar el participante
    const { data: participante, error: errorParticipante } = await supabaseServer
      .from('participantes')
      .select('*')
      .eq('id', reclutamiento.participantes_id)
      .single();
      
    console.log('👤 Participante:', participante);
    console.log('❌ Error participante:', errorParticipante);
    
    return res.status(200).json({
      reclutamiento,
      participante,
      errorReclutamiento,
      errorParticipante
    });
    
  } catch (error) {
    console.error('Error en debug:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 