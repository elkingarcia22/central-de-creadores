import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { investigacion_id } = req.query;

    // Usar exactamente la misma lógica que participantes-reclutamiento.ts
    const { data: reclutamientos, error: reclutamientosError } = await supabaseServer
      .from('reclutamientos')
      .select(`
        id,
        investigacion_id,
        participantes_id,
        participantes_internos_id,
        participantes_friend_family_id,
        tipo_participante,
        fecha_asignado,
        fecha_sesion,
        hora_sesion,
        duracion_sesion,
        reclutador_id,
        creado_por,
        estado_agendamiento,
        estado_agendamiento_cat!inner(id, nombre)
      `)
      .eq('investigacion_id', investigacion_id);

    if (reclutamientosError) {
      console.error('❌ Error obteniendo reclutamientos:', reclutamientosError);
      return res.status(500).json({ error: 'Error obteniendo reclutamientos', details: reclutamientosError.message });
    }

    console.log('🔍 Reclutamientos encontrados:', reclutamientos);

    // Extraer IDs de participantes externos
    const participantesExternosIds = reclutamientos
      .filter(r => r.participantes_id !== null)
      .map(r => r.participantes_id);

    console.log('🔍 IDs de participantes externos:', participantesExternosIds);

    // Obtener participantes externos
    if (participantesExternosIds.length > 0) {
      const { data: externosData, error: externosError } = await supabaseServer
        .from('participantes')
        .select(`
          id,
          nombre,
          email,
          tipo,
          rol_empresa_id,
          empresa_id,
          kam_id,
          descripción,
          doleres_necesidades,
          fecha_ultima_participacion,
          total_participaciones,
          productos_relacionados,
          estado_participante,
          created_at,
          updated_at,
          roles_empresa(id, nombre)
        `)
        .in('id', participantesExternosIds);

      if (externosError) {
        console.error('❌ Error obteniendo participantes externos:', externosError);
        return res.status(500).json({ error: 'Error obteniendo participantes externos', details: externosError.message });
      }

      console.log('🔍 Participantes externos obtenidos:', externosData);

      return res.status(200).json({ 
        reclutamientos,
        participantesExternosIds,
        participantesExternos: externosData
      });
    }

    return res.status(200).json({ 
      reclutamientos,
      participantesExternosIds: [],
      participantesExternos: []
    });

  } catch (error) {
    console.error('❌ Error en test-participantes-ids:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 