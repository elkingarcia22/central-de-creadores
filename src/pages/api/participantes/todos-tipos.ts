import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  console.log('🔍 Listando participantes de todos los tipos...');

  try {
    // PASO 1: Participantes externos
    console.log('🔍 PASO 1: Buscando participantes externos...');
    const { data: participantesExternos, error: errorExternos } = await supabase
      .from('participantes')
      .select('id, nombre, email, tipo, created_at')
      .limit(5);

    if (errorExternos) {
      console.error('❌ Error consultando participantes externos:', errorExternos);
    } else {
      console.log('✅ Participantes externos encontrados:', participantesExternos?.length || 0);
    }

    // PASO 2: Participantes internos
    console.log('🔍 PASO 2: Buscando participantes internos...');
    const { data: participantesInternos, error: errorInternos } = await supabase
      .from('participantes_internos')
      .select('id, nombre, email, created_at')
      .limit(5);

    if (errorInternos) {
      console.error('❌ Error consultando participantes internos:', errorInternos);
    } else {
      console.log('✅ Participantes internos encontrados:', participantesInternos?.length || 0);
    }

    // PASO 3: Participantes friend & family
    console.log('🔍 PASO 3: Buscando participantes friend & family...');
    const { data: participantesFriendFamily, error: errorFriendFamily } = await supabase
      .from('participantes_friend_family')
      .select('id, nombre, email, created_at')
      .limit(5);

    if (errorFriendFamily) {
      console.error('❌ Error consultando participantes friend & family:', errorFriendFamily);
    } else {
      console.log('✅ Participantes friend & family encontrados:', participantesFriendFamily?.length || 0);
    }

    // RESPUESTA
    return res.status(200).json({
      participantes: {
        externos: participantesExternos || [],
        internos: participantesInternos || [],
        friendFamily: participantesFriendFamily || []
      },
      resumen: {
        totalExternos: participantesExternos?.length || 0,
        totalInternos: participantesInternos?.length || 0,
        totalFriendFamily: participantesFriendFamily?.length || 0,
        totalGeneral: (participantesExternos?.length || 0) + 
                      (participantesInternos?.length || 0) + 
                      (participantesFriendFamily?.length || 0)
      }
    });

  } catch (error) {
    console.error('💥 Error general:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
