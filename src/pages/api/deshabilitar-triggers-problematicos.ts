import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔧 === DESHABILITANDO TRIGGERS PROBLEMÁTICOS ===');

    // Verificar triggers existentes primero
    console.log('1. Verificando triggers existentes...');
    
    // Ejecutar consulta para ver triggers existentes
    const { data: triggersExistentes, error: errorTriggers } = await supabase
      .from('reclutamientos')
      .select('*')
      .limit(1);

    if (errorTriggers) {
      console.error('❌ Error verificando triggers:', errorTriggers);
    }

    // Como no podemos ejecutar DDL directamente desde la API, vamos a verificar el estado actual
    console.log('2. Verificando estado actual de reclutamientos...');

    const { data: reclutamientos, error: errorReclutamientos } = await supabase
      .from('reclutamientos')
      .select(`
        id,
        investigacion_id,
        participantes_id,
        participantes_internos_id,
        participantes_friend_family_id,
        estado_agendamiento,
        fecha_sesion,
        updated_at
      `)
      .order('updated_at', { ascending: false })
      .limit(10);

    if (errorReclutamientos) {
      console.error('❌ Error verificando reclutamientos:', errorReclutamientos);
      return res.status(500).json({ error: 'Error verificando reclutamientos: ' + errorReclutamientos.message });
    }

    console.log('📊 Reclutamientos encontrados:', reclutamientos?.length || 0);

    // Verificar si hay reclutamientos con participantes_id NULL que no deberían estar NULL
    const reclutamientosConProblemas = reclutamientos?.filter(r => 
      r.participantes_id === null && 
      r.participantes_internos_id === null && 
      r.participantes_friend_family_id === null
    );

    console.log('⚠️ Reclutamientos sin participantes:', reclutamientosConProblemas?.length || 0);

    return res.status(200).json({
      success: true,
      message: 'Verificación completada',
      totalReclutamientos: reclutamientos?.length || 0,
      reclutamientosSinParticipantes: reclutamientosConProblemas?.length || 0,
      reclutamientos: reclutamientos,
      problemaIdentificado: 'Los triggers problemáticos necesitan ser eliminados manualmente desde Supabase SQL Editor',
      recomendacion: 'Ejecutar el script deshabilitar-triggers-problematicos.sql en Supabase SQL Editor'
    });

  } catch (error) {
    console.error('❌ Error en la API:', error);
    return res.status(500).json({ error: 'Error interno del servidor: ' + (error as Error).message });
  }
} 