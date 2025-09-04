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

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de participante requerido' });
  }

  console.log('🔍 DEBUG TIPOS - ID participante:', id);

  try {
    // PASO 1: Verificar en tabla participantes (externos)
    console.log('🔍 PASO 1: Verificando en tabla participantes...');
    const { data: participante, error: participanteError } = await supabase
      .from('participantes')
      .select('*')
      .eq('id', id)
      .single();

    if (participanteError) {
      console.log('❌ No encontrado en participantes:', participanteError.message);
    } else {
      console.log('✅ Encontrado en participantes:', participante);
    }

    // PASO 2: Verificar en tabla participantes_internos
    console.log('🔍 PASO 2: Verificando en tabla participantes_internos...');
    const { data: participanteInterno, error: participanteInternoError } = await supabase
      .from('participantes_internos')
      .select('*')
      .eq('id', id)
      .single();

    if (participanteInternoError) {
      console.log('❌ No encontrado en participantes_internos:', participanteInternoError.message);
    } else {
      console.log('✅ Encontrado en participantes_internos:', participanteInterno);
    }

    // PASO 3: Verificar en tabla participantes_friend_family
    console.log('🔍 PASO 3: Verificando en tabla participantes_friend_family...');
    const { data: participanteFriendFamily, error: participanteFriendFamilyError } = await supabase
      .from('participantes_friend_family')
      .select('*')
      .eq('id', id)
      .single();

    if (participanteFriendFamilyError) {
      console.log('❌ No encontrado en participantes_friend_family:', participanteFriendFamilyError.message);
    } else {
      console.log('✅ Encontrado en participantes_friend_family:', participanteFriendFamily);
    }

    // PASO 4: Buscar reclutamientos en todas las tablas posibles
    console.log('🔍 PASO 4: Buscando reclutamientos...');
    
    // Buscar por participantes_id (externos)
    const { data: reclutamientosExternos, error: reclutamientosExternosError } = await supabase
      .from('reclutamientos')
      .select('*')
      .eq('participantes_id', id);

    if (reclutamientosExternosError) {
      console.log('❌ Error consultando reclutamientos por participantes_id:', reclutamientosExternosError.message);
    } else {
      console.log('✅ Reclutamientos por participantes_id:', reclutamientosExternos);
    }

    // Buscar por participantes_internos_id
    const { data: reclutamientosInternos, error: reclutamientosInternosError } = await supabase
      .from('reclutamientos')
      .select('*')
      .eq('participantes_internos_id', id);

    if (reclutamientosInternosError) {
      console.log('❌ Error consultando reclutamientos por participantes_internos_id:', reclutamientosInternosError.message);
    } else {
      console.log('✅ Reclutamientos por participantes_internos_id:', reclutamientosInternos);
    }

    // Buscar por participantes_friend_family_id
    const { data: reclutamientosFriendFamily, error: reclutamientosFriendFamilyError } = await supabase
      .from('reclutamientos')
      .select('*')
      .eq('participantes_friend_family_id', id);

    if (reclutamientosFriendFamilyError) {
      console.log('❌ Error consultando reclutamientos por participantes_friend_family_id:', reclutamientosFriendFamilyError.message);
    } else {
      console.log('✅ Reclutamientos por participantes_friend_family_id:', reclutamientosFriendFamily);
    }

    // RESPUESTA COMPLETA
    return res.status(200).json({
      debug: {
        participante,
        participanteInterno,
        participanteFriendFamily,
        reclutamientosExternos,
        reclutamientosInternos,
        reclutamientosFriendFamily,
        resumen: {
          tipoEncontrado: participante ? 'externo' : 
                          participanteInterno ? 'interno' : 
                          participanteFriendFamily ? 'friend_family' : 'no_encontrado',
          totalReclutamientos: (reclutamientosExternos?.length || 0) + 
                               (reclutamientosInternos?.length || 0) + 
                               (reclutamientosFriendFamily?.length || 0)
        }
      }
    });

  } catch (error) {
    console.error('💥 Error general en debug tipos:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
