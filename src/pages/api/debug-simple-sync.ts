import { NextApiRequest, NextApiResponse } from 'next';
import { simpleSyncCalendar } from '../../lib/simple-sync-calendar';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { action, reclutamiento_id, user_id } = req.body;

  if (!action || !reclutamiento_id || !user_id) {
    return res.status(400).json({ 
      error: 'Faltan parámetros requeridos',
      required: ['action', 'reclutamiento_id', 'user_id']
    });
  }

  try {
    console.log('🔍 === DEBUG SIMPLE SYNC ===');
    console.log('🔍 Action:', action);
    console.log('🔍 Reclutamiento ID:', reclutamiento_id);
    console.log('🔍 User ID:', user_id);

    const result = await simpleSyncCalendar({
      userId: user_id,
      reclutamientoId: reclutamiento_id,
      action: action as 'create' | 'update' | 'delete'
    });

    console.log('🔍 Resultado de simple sync:', result);

    return res.status(200).json({ 
      success: true, 
      result 
    });

  } catch (error) {
    console.error('❌ Error en debug simple sync:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
