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

  console.log('🔍 DEBUG API - ID participante:', id);

  try {
    // PASO 1: Verificar que el participante existe
    console.log('🔍 PASO 1: Verificando participante...');
    const { data: participante, error: participanteError } = await supabase
      .from('participantes')
      .select('*')
      .eq('id', id)
      .single();

    if (participanteError) {
      console.error('❌ Error consultando participante:', participanteError);
      return res.status(404).json({ 
        error: 'Participante no encontrado',
        details: participanteError 
      });
    }

    console.log('✅ Participante encontrado:', participante);

    // PASO 2: Buscar reclutamientos para este participante
    console.log('🔍 PASO 2: Buscando reclutamientos...');
    const { data: reclutamientos, error: reclutamientosError } = await supabase
      .from('reclutamientos')
      .select('*')
      .eq('participantes_id', id);

    if (reclutamientosError) {
      console.error('❌ Error consultando reclutamientos:', reclutamientosError);
      return res.status(500).json({ 
        error: 'Error consultando reclutamientos',
        details: reclutamientosError 
      });
    }

    console.log('✅ Reclutamientos encontrados:', reclutamientos);

    // PASO 3: Si hay reclutamientos, buscar investigaciones
    let investigaciones = [];
    if (reclutamientos && reclutamientos.length > 0) {
      console.log('🔍 PASO 3: Buscando investigaciones...');
      const investigacionIds = reclutamientos.map(r => r.investigacion_id).filter(Boolean);
      
      if (investigacionIds.length > 0) {
        const { data: invs, error: invError } = await supabase
          .from('investigaciones')
          .select('*')
          .in('id', investigacionIds);

        if (invError) {
          console.error('❌ Error consultando investigaciones:', invError);
        } else {
          investigaciones = invs || [];
          console.log('✅ Investigaciones encontradas:', investigaciones);
        }
      }
    }

    // PASO 4: Si hay investigaciones, buscar usuarios responsables
    let usuarios = [];
    if (investigaciones.length > 0) {
      console.log('🔍 PASO 4: Buscando usuarios...');
      const usuarioIds = investigaciones
        .map(inv => [inv.responsable_id, inv.implementador_id])
        .flat()
        .filter(Boolean);

      if (usuarioIds.length > 0) {
        const { data: usrs, error: usrError } = await supabase
          .from('usuarios')
          .select('*')
          .in('id', usuarioIds);

        if (usrError) {
          console.error('❌ Error consultando usuarios:', usrError);
        } else {
          usuarios = usrs || [];
          console.log('✅ Usuarios encontrados:', usuarios);
        }
      }
    }

    // RESPUESTA COMPLETA DE DEBUG
    return res.status(200).json({
      debug: {
        participante,
        reclutamientos,
        investigaciones,
        usuarios,
        totalReclutamientos: reclutamientos?.length || 0,
        totalInvestigaciones: investigaciones?.length || 0,
        totalUsuarios: usuarios?.length || 0
      }
    });

  } catch (error) {
    console.error('💥 Error general en debug:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
