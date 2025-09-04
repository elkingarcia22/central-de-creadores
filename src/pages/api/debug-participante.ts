import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de participante requerido' });
  }

  try {
    console.log('🔍 DEBUG - Buscando participante con ID:', id);

    // PASO 1: Buscar en participantes (externos)
    console.log('🔍 PASO 1: Buscando en participantes (externos)...');
    const { data: participanteExterno, error: errorExterno } = await supabaseServer
      .from('participantes')
      .select('id, nombre, email')
      .eq('id', id)
      .single();

    console.log('🔍 Resultado participantes (externos):', { data: participanteExterno, error: errorExterno });

    // PASO 2: Buscar en participantes_internos
    console.log('🔍 PASO 2: Buscando en participantes_internos...');
    const { data: participanteInterno, error: errorInterno } = await supabaseServer
      .from('participantes_internos')
      .select('id, nombre, email')
      .eq('id', id)
      .single();

    console.log('🔍 Resultado participantes_internos:', { data: participanteInterno, error: errorInterno });

    // PASO 3: Buscar en participantes_friend_family
    console.log('🔍 PASO 3: Buscando en participantes_friend_family...');
    const { data: participanteFriendFamily, error: errorFriendFamily } = await supabaseServer
      .from('participantes_friend_family')
      .select('id, nombre, email')
      .eq('id', id)
      .single();

    console.log('🔍 Resultado participantes_friend_family:', { data: participanteFriendFamily, error: errorFriendFamily });

    // PASO 4: Determinar tipo y datos
    let tipoParticipante = '';
    let participanteData = null;

    if (participanteExterno) {
      tipoParticipante = 'externo';
      participanteData = participanteExterno;
    } else if (participanteInterno) {
      tipoParticipante = 'interno';
      participanteData = participanteInterno;
    } else if (participanteFriendFamily) {
      tipoParticipante = 'friend_family';
      participanteData = participanteFriendFamily;
    }

    console.log('🔍 RESULTADO FINAL:', { tipoParticipante, participanteData });

    return res.status(200).json({
      id,
      tipoParticipante,
      participanteData,
      debug: {
        externo: { data: participanteExterno, error: errorExterno },
        interno: { data: participanteInterno, error: errorInterno },
        friend_family: { data: participanteFriendFamily, error: errorFriendFamily }
      }
    });

  } catch (error) {
    console.error('❌ Error en debug-participante:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
