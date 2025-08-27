import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      console.log('🔄 GET /api/participantes-todos - Obteniendo todos los participantes...');

      // Obtener participantes externos usando la misma lógica que la API de participantes
      const { data: participantesExternos, error: errorExternos } = await supabaseServer
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
          updated_at
        `)
        .order('nombre');

      if (errorExternos) {
        console.error('❌ Error obteniendo participantes externos:', errorExternos);
      } else {
        console.log('✅ Participantes externos obtenidos:', participantesExternos?.length || 0);
      }

      // Obtener participantes internos con información relacionada
      const { data: participantesInternos, error: errorInternos } = await supabaseServer
        .from('participantes_internos')
        .select(`
          id,
          nombre,
          email,
          departamento_id,
          rol_empresa_id,
          created_at,
          updated_at,
          departamentos(nombre)
        `);

      if (errorInternos) {
        console.error('❌ Error obteniendo participantes internos:', errorInternos);
      } else {
        console.log('✅ Participantes internos obtenidos:', participantesInternos?.length || 0);
      }

      // Obtener participantes friend & family con información relacionada
      const { data: participantesFriendFamily, error: errorFriendFamily } = await supabaseServer
        .from('participantes_friend_family')
        .select(`
          id,
          nombre,
          email,
          departamento_id,
          rol_empresa_id,
          created_at,
          updated_at,
          departamentos(nombre)
        `);

      if (errorFriendFamily) {
        console.error('❌ Error obteniendo participantes friend & family:', errorFriendFamily);
      } else {
        console.log('✅ Participantes friend & family obtenidos:', participantesFriendFamily?.length || 0);
      }

      // Obtener datos relacionados para participantes externos
      const { data: rolesData } = await supabaseServer
        .from('roles_empresa')
        .select('id, nombre');

      const { data: empresasData } = await supabaseServer
        .from('empresas')
        .select('id, nombre');

      const { data: estadosData } = await supabaseServer
        .from('estado_participante_cat')
        .select('id, nombre')
        .eq('activo', true)
        .order('nombre');

      const rolesMap = new Map(rolesData?.map(rol => [rol.id, rol.nombre]) || []);
      const empresasMap = new Map(empresasData?.map(empresa => [empresa.id, empresa.nombre]) || []);
      const estadosMap = new Map(estadosData?.map(estado => [estado.id, estado.nombre]) || []);

      // Función para obtener la fecha de última participación real (solo finalizadas)
      const obtenerFechaUltimaParticipacion = async (participanteId: string, tipo: string) => {
        try {
          // Primero obtener el ID del estado "Finalizado"
          const { data: estadosData } = await supabaseServer
            .from('estado_agendamiento_cat')
            .select('id, nombre')
            .ilike('nombre', '%finalizado%');
          
          const estadoFinalizadoId = estadosData?.[0]?.id;
          
          if (!estadoFinalizadoId) {
            console.warn('No se encontró estado "Finalizado" en estado_agendamiento_cat');
            return null;
          }
          
          let query;
          switch (tipo) {
            case 'externo':
              query = supabaseServer
                .from('reclutamientos')
                .select('fecha_asignado')
                .eq('participantes_id', participanteId)
                .eq('estado_agendamiento', estadoFinalizadoId)
                .order('fecha_asignado', { ascending: false })
                .limit(1);
              break;
            case 'interno':
              query = supabaseServer
                .from('reclutamientos')
                .select('fecha_asignado')
                .eq('participantes_internos_id', participanteId)
                .eq('estado_agendamiento', estadoFinalizadoId)
                .order('fecha_asignado', { ascending: false })
                .limit(1);
              break;
            case 'friend_family':
              query = supabaseServer
                .from('reclutamientos')
                .select('fecha_asignado')
                .eq('participantes_friend_family_id', participanteId)
                .eq('estado_agendamiento', estadoFinalizadoId)
                .order('fecha_asignado', { ascending: false })
                .limit(1);
              break;
            default:
              return null;
          }
          
          const { data } = await query;
          return data && data.length > 0 ? data[0].fecha_asignado : null;
        } catch (error) {
          console.error(`Error obteniendo fecha de última participación para ${participanteId}:`, error);
          return null;
        }
      };

      // Función para obtener el total de participaciones real (solo finalizadas)
      const obtenerTotalParticipaciones = async (participanteId: string, tipo: string) => {
        try {
          // Primero obtener el ID del estado "Finalizado"
          const { data: estadosData } = await supabaseServer
            .from('estado_agendamiento_cat')
            .select('id, nombre')
            .ilike('nombre', '%finalizado%');
          
          const estadoFinalizadoId = estadosData?.[0]?.id;
          
          if (!estadoFinalizadoId) {
            console.warn('No se encontró estado "Finalizado" en estado_agendamiento_cat');
            return 0;
          }
          
          let query;
          switch (tipo) {
            case 'externo':
              query = supabaseServer
                .from('reclutamientos')
                .select('id', { count: 'exact' })
                .eq('participantes_id', participanteId)
                .eq('estado_agendamiento', estadoFinalizadoId);
              break;
            case 'interno':
              query = supabaseServer
                .from('reclutamientos')
                .select('id', { count: 'exact' })
                .eq('participantes_internos_id', participanteId)
                .eq('estado_agendamiento', estadoFinalizadoId);
              break;
            case 'friend_family':
              query = supabaseServer
                .from('reclutamientos')
                .select('id', { count: 'exact' })
                .eq('participantes_friend_family_id', participanteId)
                .eq('estado_agendamiento', estadoFinalizadoId);
              break;
            default:
              return 0;
          }
          
          const { count } = await query;
          return count || 0;
        } catch (error) {
          console.error(`Error obteniendo total de participaciones para ${participanteId}:`, error);
          return 0;
        }
      };

      // Combinar y transformar todos los participantes con datos reales
      const participantesCombinados = await Promise.all([
        ...(participantesExternos || []).map(async p => {
          const fechaUltimaParticipacion = await obtenerFechaUltimaParticipacion(p.id, 'externo');
          const totalParticipaciones = await obtenerTotalParticipaciones(p.id, 'externo');
          
          const participanteTransformado = {
            id: p.id,
            nombre: p.nombre,
            email: p.email || 'sin-email@ejemplo.com',
            tipo: 'externo' as const,
            empresa_nombre: empresasMap.get(p.empresa_id) || 'Sin empresa',
            rol_empresa: rolesMap.get(p.rol_empresa_id) || 'Sin rol',
            departamento_nombre: undefined,
            estado_participante: estadosMap.get(p.estado_participante) || 'Sin estado',
            fecha_ultima_participacion: fechaUltimaParticipacion,
            total_participaciones: totalParticipaciones,
            comentarios: p.descripción || '',
            doleres_necesidades: p.doleres_necesidades || '',
            created_at: p.created_at,
            updated_at: p.updated_at
          };
          
          console.log('🔍 Participante externo transformado:', participanteTransformado);
          return participanteTransformado;
        }),
        ...(participantesInternos || []).map(async p => {
          const fechaUltimaParticipacion = await obtenerFechaUltimaParticipacion(p.id, 'interno');
          const totalParticipaciones = await obtenerTotalParticipaciones(p.id, 'interno');
          
          return {
            id: p.id,
            nombre: p.nombre,
            email: p.email || 'sin-email@ejemplo.com',
            tipo: 'interno' as const,
            empresa_nombre: undefined,
            rol_empresa: rolesMap.get(p.rol_empresa_id) || 'Sin rol',
            departamento_nombre: p.departamentos?.nombre || 'Sin departamento',
            estado_participante: 'Activo',
            fecha_ultima_participacion: fechaUltimaParticipacion,
            total_participaciones: totalParticipaciones,
            comentarios: '',
            doleres_necesidades: '',
            created_at: p.created_at,
            updated_at: p.updated_at
          };
        }),
        ...(participantesFriendFamily || []).map(async p => {
          const fechaUltimaParticipacion = await obtenerFechaUltimaParticipacion(p.id, 'friend_family');
          const totalParticipaciones = await obtenerTotalParticipaciones(p.id, 'friend_family');
          
          return {
            id: p.id,
            nombre: p.nombre,
            email: p.email || 'sin-email@ejemplo.com',
            tipo: 'friend_family' as const,
            empresa_nombre: undefined,
            rol_empresa: rolesMap.get(p.rol_empresa_id) || 'Sin rol',
            departamento_nombre: p.departamentos?.nombre || 'Sin departamento',
            estado_participante: 'Activo',
            fecha_ultima_participacion: fechaUltimaParticipacion,
            total_participaciones: totalParticipaciones,
            comentarios: '',
            doleres_necesidades: '',
            created_at: p.created_at,
            updated_at: p.updated_at
          };
        })
      ]);

      console.log('✅ Participantes obtenidos:', {
        externos: participantesExternos?.length || 0,
        internos: participantesInternos?.length || 0,
        friendFamily: participantesFriendFamily?.length || 0,
        total: participantesCombinados.length
      });

      console.log('🔍 Primer participante externo:', participantesExternos?.[0]);
      console.log('🔍 Primer participante interno:', participantesInternos?.[0]);
      console.log('🔍 Primer participante friend & family:', participantesFriendFamily?.[0]);
      console.log('🔍 Primer participante combinado:', participantesCombinados[0]);

      return res.status(200).json({
        success: true,
        participantes: participantesCombinados,
        resumen: {
          total: participantesCombinados.length,
          externos: participantesExternos?.length || 0,
          internos: participantesInternos?.length || 0,
          friendFamily: participantesFriendFamily?.length || 0
        }
      });

    } catch (error) {
      console.error('❌ Error en participantes-todos:', error);
      return res.status(500).json({ 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
}
