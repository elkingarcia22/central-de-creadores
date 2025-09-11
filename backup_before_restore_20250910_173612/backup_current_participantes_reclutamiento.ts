import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { reclutamiento_id, investigacion_id, participante_id_only } = req.query;

    // Si se proporciona participante_id_only, buscar solo ese participante
    if (participante_id_only) {
      
      // Buscar en participantes externos
      const { data: participanteExterno, error: errorExterno } = await supabaseServer
        .from('participantes')
        .select(`
          id,
          nombre,
          email,
          tipo,
          rol_empresa_id,
          empresa_id,
          created_at,
          updated_at
        `)
        .eq('id', participante_id_only)
        .single();

      if (participanteExterno) {
        // Calcular estado de enfriamiento para este participante
        const calcularEstadoParticipante = (fechaUltimaParticipacion: string | null): { estado: string, mensaje?: string } => {
          if (!fechaUltimaParticipacion) {
            return { estado: 'Disponible' };
          }
          const fechaUltima = new Date(fechaUltimaParticipacion);
          const fechaActual = new Date();
          const diferenciaDias = (fechaActual.getTime() - fechaUltima.getTime()) / (1000 * 60 * 60 * 24);
          if (diferenciaDias < 30) {
            return {
              estado: 'En enfriamiento',
              mensaje: `Participó hace ${Math.ceil(diferenciaDias)} días. No es recomendable volver a elegirlo hasta que pasen 30 días.`
            };
          } else {
            return { estado: 'Disponible' };
          }
        };

        const getEstadoColor = (estado: string): string => {
          switch (estado) {
            case 'En enfriamiento': return '#f59e0b';
            case 'Disponible': return '#10b981';
            default: return '#6b7280';
          }
        };

        // Buscar la fecha de última participación real
        const { data: ultimoReclutamiento, error: errorUltimo } = await supabaseServer
          .from('reclutamientos')
          .select('fecha_sesion')
          .eq('participantes_id', participante_id_only)
          .order('fecha_sesion', { ascending: false })
          .limit(1)
          .single();

        let fechaUltimaParticipacionReal = null;
        if (ultimoReclutamiento) {
          fechaUltimaParticipacionReal = ultimoReclutamiento.fecha_sesion;
        }

        const estadoCalculado = calcularEstadoParticipante(fechaUltimaParticipacionReal);

        // Obtener información adicional del participante
        const participanteCompleto = {
          id: participanteExterno?.id,
          nombre: participanteExterno?.nombre,
          email: participanteExterno?.email,
          empresa_id: participanteExterno?.empresa_id,
          rol_empresa_id: participanteExterno?.rol_empresa_id,
          tipo: 'externo',
          estado_calculado: {
            estado: estadoCalculado.estado,
            mensaje: estadoCalculado.mensaje,
            color: getEstadoColor(estadoCalculado.estado)
          }
        };

        return res.status(200).json({ 
          participantes: [participanteCompleto], 
          total: 1 
        });
      }

      // Si no se encuentra en participantes externos, buscar en internos
      const { data: participanteInterno, error: errorInterno } = await supabaseServer
        .from('participantes_internos')
        .select(`
          id,
          nombre,
          email,
          departamento_id,
          rol_empresa_id,
          created_at,
          updated_at
        `)
        .eq('id', participante_id_only)
        .single();

      if (participanteInterno) {
        return res.status(200).json({ 
          participantes: [{ ...participanteInterno, tipo: 'interno' }], 
          total: 1 
        });
      }

      // Si no se encuentra en internos, buscar en friend & family
      const { data: participanteFriendFamily, error: errorFriendFamily } = await supabaseServer
        .from('participantes_friend_family')
        .select(`
          id,
          nombre,
          email,
          departamento_id,
          rol_empresa_id,
          created_at,
          updated_at
        `)
        .eq('id', participante_id_only)
        .single();

      if (participanteFriendFamily) {
        return res.status(200).json({ 
          participantes: [{ ...participanteFriendFamily, tipo: 'friend_family' }], 
          total: 1 
        });
      }

      return res.status(404).json({ error: 'Participante no encontrado' });
    }

    // Lógica original para reclutamiento_id o investigacion_id
    let participantes: any[] = [];

    if (reclutamiento_id || investigacion_id) {
      
      // Construir la consulta base
      let query = supabaseServer
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
          estado_agendamiento,estado_agendamiento,
          estado_agendamiento,estado_agendamiento_cat!inner(id, nombre)
        `);
      if (reclutamiento_id) {
        query = query.eq('id', reclutamiento_id);
      }
      if (investigacion_id) {
        query = query.eq('investigacion_id', investigacion_id);
      }

      const { data: reclutamientos, error: reclutamientosError } = await query;

      if (reclutamientosError) {
        console.error('❌ Error obteniendo reclutamientos:', reclutamientosError);
        return res.status(500).json({ error: 'Error obteniendo reclutamientos', details: reclutamientosError.message });
      }

      if (!reclutamientos || reclutamientos.length === 0) {
        console.log('🔍 No se encontraron reclutamientos para:', { reclutamiento_id, investigacion_id });
        return res.status(200).json({ participantes: [], total: 0 });
      }

      console.log('🔍 Reclutamientos encontrados:', reclutamientos.length);
      console.log('🔍 Primer reclutamiento:', reclutamientos[0]);
      console.log('🔍 Todos los reclutamientos:', reclutamientos);

      // Extraer IDs de participantes externos e internos
      const participantesExternosIds = reclutamientos
        .filter(r => r.participantes_id !== null)
        .map(r => r.participantes_id);
      
      const participantesInternosIds = reclutamientos
        .filter(r => r.participantes_internos_id !== null)
        .map(r => r.participantes_internos_id);

      const participantesFriendFamilyIds = reclutamientos
        .filter(r => r.participantes_friend_family_id !== null)
        .map(r => r.participantes_friend_family_id);

      // Obtener participantes externos
      let participantesExternosData: any = {};
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
        } else if (externosData) {
          externosData.forEach((p: any) => {
            participantesExternosData[p.id] = p;
          });
        }
        
      }

      // Obtener empresas y roles para participantes externos
      const empresasIds = Object.values(participantesExternosData)
        .map((p: any) => p.empresa_id)
        .filter(Boolean);
      
      let empresasData: any = {};
      if (empresasIds.length > 0) {
        const { data: empresas, error: empresasError } = await supabaseServer
          .from('empresas')
          .select('id, nombre')
          .in('id', empresasIds);

        if (!empresasError && empresas) {
          empresas.forEach((e: any) => {
            empresasData[e.id] = e;
          });
        }
      }

      // Obtener datos del reclutador
      const reclutadoresIds = reclutamientos
        .map(r => r.reclutador_id)
        .filter(Boolean);
      
      let reclutadoresData: any = {};
      if (reclutadoresIds.length > 0) {
        const { data: reclutadores, error: reclutadoresError } = await supabaseServer
          .from('profiles')
          .select('id, full_name, email')
          .in('id', reclutadoresIds);

        if (!reclutadoresError && reclutadores) {
          reclutadores.forEach((r: any) => {
            reclutadoresData[r.id] = r;
          });
        }
      }

      // Obtener participantes internos
      let participantesInternosData: any = {};
      if (participantesInternosIds.length > 0) {
        const { data: internosData, error: internosError } = await supabaseServer
          .from('participantes_internos')
          .select(`
            id,
            nombre,
            email,
            departamento_id,
            rol_empresa_id,
            created_at,
            departamentos(id, nombre, categoria),
            roles_empresa(id, nombre)
          `)
          .in('id', participantesInternosIds);

        if (!internosError && internosData) {
          internosData.forEach((p: any) => {
            participantesInternosData[p.id] = p;
          });
        } else {
          console.error('❌ Error cargando participantes internos:', internosError);
        }
      }

      // Obtener participantes Friend and Family
      let participantesFriendFamilyData: any = {};
      if (participantesFriendFamilyIds.length > 0) {
        const { data: friendFamilyData, error: friendFamilyError } = await supabaseServer
          .from('participantes_friend_family')
          .select(`
            id,
            nombre,
            email,
            departamento_id,
            rol_empresa_id,
            created_at,
            departamentos(id, nombre, categoria),
            roles_empresa(id, nombre)
          `)
          .in('id', participantesFriendFamilyIds);

        if (!friendFamilyError && friendFamilyData) {
          friendFamilyData.forEach((p: any) => {
            participantesFriendFamilyData[p.id] = p;
          });
        } else {
          console.error('❌ Error cargando participantes friend & family:', friendFamilyError);
        }
      }

      // Formatear los datos enriquecidos
      participantes = await Promise.all(reclutamientos.map(async (reclutamiento: any) => {
        
        // Si tiene participantes_internos_id, es interno
        // Si tiene participantes_id, es externo
        // Si tiene participantes_friend_family_id, es friend_family
        const esInterno = reclutamiento.participantes_internos_id !== null;
        const esFriendFamily = reclutamiento.participantes_friend_family_id !== null;
        
        // Obtener el participante directamente
        let participante = null;
        if (esInterno) {
          participante = participantesInternosData[reclutamiento.participantes_internos_id];
        } else if (esFriendFamily) {
          participante = participantesFriendFamilyData[reclutamiento.participantes_friend_family_id];
        } else {
          // Usar los datos ya obtenidos de participantesExternosData
          participante = participantesExternosData[reclutamiento.participantes_id];
        }

        // Obtener información de empresa para participantes externos
        let empresaInfo = null;
        
        if (!esInterno && !esFriendFamily && participante?.empresa_id) {
          const empresa = empresasData[participante.empresa_id];
          if (empresa) {
            empresaInfo = {
              id: empresa.id,
              nombre: empresa.nombre,
              kam_id: empresa.kam_id,
              tamano: empresa.tamano_empresa?.nombre || empresa.tamaño,
              pais: empresa.paises?.nombre || empresa.pais,
              industria: empresa.industrias?.nombre || empresa.industria,
              estado: empresa.estados_reclutamiento?.nombre || empresa.estado,
              relacion: empresa.relaciones_empresa?.nombre || empresa.relacion,
              modalidad: empresa.modalidades_empresa?.nombre || empresa.modalidad,
              descripcion: empresa.descripcion
            };
          }
        }

        return {
          id: participante?.id || reclutamiento.id,
          reclutamiento_id: reclutamiento.id,
          nombre: participante?.nombre || '',
          email: participante?.email || '',
          tipo: participante?.tipo || (esInterno ? 'interno' : esFriendFamily ? 'friend_family' : 'externo'),
          tipo_participante: reclutamiento.tipo_participante || (esInterno ? 'interno' : esFriendFamily ? 'friend_family' : 'externo'),
          
          // Información de empresa (solo para externos)
          empresa: !esInterno && !esFriendFamily ? (empresaInfo ? {
            id: empresaInfo.id,
            nombre: empresaInfo.nombre,
            kam_id: empresaInfo.kam_id,
            tamano: empresaInfo.tamano,
            pais: empresaInfo.pais,
            industria: empresaInfo.industria,
            estado: empresaInfo.estado,
            relacion: empresaInfo.relacion,
            modalidad: empresaInfo.modalidad,
            descripcion: empresaInfo.descripcion
          } : null) : null,
          empresa_nombre: !esInterno && !esFriendFamily ? (empresaInfo?.nombre || null) : null,
          
          // Información de rol (para externos, internos y friend_family)
          rol_empresa: esInterno ? (participante?.roles_empresa?.nombre || 'Sin rol especificado') : 
            (esFriendFamily ? (participante?.roles_empresa?.nombre || 'Sin rol especificado') : 
            (participante?.roles_empresa?.nombre || 'Sin rol especificado')),
          
          // Información de departamento (para internos y friend_family)
          departamento: (esInterno || esFriendFamily) 
            ? (participante?.departamentos ? {
                id: participante.departamentos.id,
                nombre: participante.departamentos.nombre,
                categoria: participante.departamentos.categoria
              } : null)
            : null,
          
          // Información del participante
          estado_participante: participante?.estado_participante || 'Activo',
          fecha_ultima_participacion: participante?.fecha_ultima_participacion || '',
          cantidad_participaciones: participante?.total_participaciones || 0,
          
          // Información adicional del participante
          comentarios: participante?.descripción || '',
          doleres_necesidades: participante?.doleres_necesidades || '',
          
          // Información de reclutamiento
          fecha_sesion: reclutamiento.fecha_sesion,
          hora_sesion: reclutamiento.hora_sesion || null,
          estado_agendamiento: reclutamiento.estado_agendamiento_cat?.nombre || reclutamiento.estado_agendamiento,
          fecha_asignado: reclutamiento.fecha_asignado,
          fecha_creacion: participante?.created_at || '',
          reclutador: reclutadoresData[reclutamiento.reclutador_id] || null,
          reclutador_nombre: reclutadoresData[reclutamiento.reclutador_id]?.full_name || reclutadoresData[reclutamiento.reclutador_id]?.email || null
        };
      }));
    } else {
      return res.status(400).json({ error: 'Se requiere reclutamiento_id o investigacion_id' });
    }

    return res.status(200).json({
      participantes,
      total: participantes.length
    });

  } catch (error) {
    console.error('❌ Error en participantes-reclutamiento:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 