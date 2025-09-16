import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'GET') {
    return await getSesiones(req, res);
  } else if (method === 'POST') {
    return await createSesion(req, res);
  } else if (method === 'DELETE') {
    return await deleteSesion(req, res);
  } else {
    return res.status(405).json({ error: 'Método no permitido' });
  }
}

async function getSesiones(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!supabaseServer) {
      console.error('❌ Cliente de Supabase no disponible');
      return res.status(500).json({ error: 'Cliente de Supabase no configurado' });
    }

    const userId = req.headers['x-user-id'] as string || req.query.userId as string;
    const rolSeleccionado = req.headers['x-rol-seleccionado'] as string || req.query.rolSeleccionado as string;
    
    console.log('🔄 Obteniendo sesiones de reclutamiento para usuario:', userId);
    console.log('🎭 Rol seleccionado:', rolSeleccionado);

    let esAdmin = false;
    if (rolSeleccionado) {
      esAdmin = rolSeleccionado.toLowerCase().includes('admin') || 
                rolSeleccionado.toLowerCase().includes('administrador');
      console.log('🔑 Usuario es administrador según rol seleccionado:', esAdmin);
    }

    console.log('👤 Usuario es administrador:', esAdmin);

    let query = supabaseServer
      .from('reclutamientos')
      .select('*')
      .order('fecha_sesion', { ascending: true });

    if (!esAdmin && userId) {
      query = query.eq('reclutador_id', userId);
    }

    const { data: reclutamientos, error } = await query;

    if (error) {
      console.error('❌ Error obteniendo reclutamientos:', error);
      return res.status(500).json({ error: 'Error obteniendo sesiones de reclutamiento' });
    }

    console.log('📊 Reclutamientos obtenidos:', reclutamientos?.length || 0);

    // Función para obtener datos completos del reclutamiento (similar a reclutamiento-actual)
    const obtenerDatosCompletos = async (reclutamiento: any) => {
      let participante = null;
      let tipoParticipante = 'externo';
      let investigacionNombre = 'Sin investigación';
      let responsableReal = 'Sin asignar';
      let implementadorReal = 'Sin asignar';
      let estadoAgendamientoNombre = 'Sin estado';
      let observadores = [];

      try {
        // 1. Obtener datos del participante
        if (reclutamiento.participantes_id) {
          const { data: participanteData } = await supabaseServer
            .from('participantes')
            .select('id, nombre, email')
            .eq('id', reclutamiento.participantes_id)
            .single();
          
          if (participanteData) {
            participante = {
              id: participanteData.id,
              nombre: participanteData.nombre,
              email: participanteData.email,
              tipo: 'externo' as const
            };
            tipoParticipante = 'externo';
          }
        } else if (reclutamiento.participantes_internos_id) {
          const { data: participanteData } = await supabaseServer
            .from('participantes_internos')
            .select('id, nombre, email')
            .eq('id', reclutamiento.participantes_internos_id)
            .single();
          
          if (participanteData) {
            participante = {
              id: participanteData.id,
              nombre: participanteData.nombre,
              email: participanteData.email,
              tipo: 'interno' as const
            };
            tipoParticipante = 'interno';
          }
        } else if (reclutamiento.participantes_friend_family_id) {
          const { data: participanteData } = await supabaseServer
            .from('participantes_friend_family')
            .select('id, nombre, email')
            .eq('id', reclutamiento.participantes_friend_family_id)
            .single();
          
          if (participanteData) {
            participante = {
              id: participanteData.id,
              nombre: participanteData.nombre,
              email: participanteData.email,
              tipo: 'friend_family' as const
            };
            tipoParticipante = 'friend_family';
          }
        }

        // 2. Obtener datos de la investigación
        if (reclutamiento.investigacion_id) {
          const { data: investigacionData } = await supabaseServer
            .from('investigaciones')
            .select('id, nombre, responsable_id, implementador_id')
            .eq('id', reclutamiento.investigacion_id)
            .single();
          
          if (investigacionData) {
            investigacionNombre = investigacionData.nombre || 'Sin nombre';

            // 3. Obtener datos del responsable - usar responsable_id de la investigación para todos los tipos
            if (investigacionData.responsable_id) {
              const { data: responsableData } = await supabaseServer
                .from('usuarios')
                .select('id, nombre, correo')
                .eq('id', investigacionData.responsable_id)
                .single();
              
              if (responsableData) {
                responsableReal = responsableData.nombre || 'Sin nombre';
              }
            }

            // 4. Obtener datos del implementador
            if (investigacionData.implementador_id) {
              const { data: implementadorData } = await supabaseServer
                .from('usuarios')
                .select('id, nombre, correo')
                .eq('id', investigacionData.implementador_id)
                .single();
              
              if (implementadorData) {
                implementadorReal = implementadorData.nombre || 'Sin nombre';
              }
            }
          }
        }

        // 5. Obtener observadores desde el libreto de la investigación
        if (reclutamiento.investigacion_id) {
          const { data: libretoData } = await supabaseServer
            .from('libretos_investigacion')
            .select('usuarios_participantes')
            .eq('investigacion_id', reclutamiento.investigacion_id)
            .single();
          
          if (libretoData && libretoData.usuarios_participantes) {
            observadores = libretoData.usuarios_participantes;
            console.log('🔍 Observadores encontrados en libreto:', observadores);
          }
        }

        // 6. Obtener nombre del estado de agendamiento
        if (reclutamiento.estado_agendamiento) {
          const { data: estadoData } = await supabaseServer
            .from('estado_agendamiento_cat')
            .select('nombre')
            .eq('id', reclutamiento.estado_agendamiento)
            .single();
          
          if (estadoData) {
            estadoAgendamientoNombre = estadoData.nombre || 'Sin nombre';
          }
        }

      } catch (error) {
        console.log('⚠️ Error general obteniendo datos completos:', error);
      }

      return { 
        participante, 
        tipoParticipante, 
        investigacionNombre, 
        responsableReal, 
        implementadorReal,
        estadoAgendamientoNombre,
        observadores
      };
    };

    // Procesar cada reclutamiento
    const sesionesPromises = reclutamientos?.map(async (reclutamiento) => {
      // Obtener datos completos del reclutamiento
      const { 
        participante, 
        tipoParticipante, 
        investigacionNombre, 
        responsableReal, 
        implementadorReal,
        estadoAgendamientoNombre,
        observadores
      } = await obtenerDatosCompletos(reclutamiento);

      // Usar el nombre real del estado de agendamiento
      const estadoReal = estadoAgendamientoNombre;

      // Información del reclutador
      let reclutador = null;
      if (reclutamiento.reclutador_id) {
        reclutador = {
          id: reclutamiento.reclutador_id,
          full_name: responsableReal, // Usar el nombre real del responsable
          email: ''
        };
      }

      return {
        id: reclutamiento.id,
        titulo: `Sesión de Reclutamiento - ${reclutamiento.id}`,
        descripcion: `Sesión de investigación programada`,
        fecha_programada: reclutamiento.fecha_sesion,
        duracion_minutos: reclutamiento.duracion_sesion,
        ubicacion: 'Oficina Principal',
        investigacion_id: reclutamiento.investigacion_id,
        investigacion_nombre: investigacionNombre,
        estado: reclutamiento.estado_agendamiento === '7b923720-3a4e-41db-967f-0f346114f029' ? 'completada' : 'programada',
        tipo_sesion: 'presencial',
        grabacion_permitida: true,
        notas_publicas: `Estado: ${estadoReal}`,
        created_at: reclutamiento.created_at,
        updated_at: reclutamiento.updated_at,
        participante: participante,
        tipo_participante: tipoParticipante,
        reclutador: reclutador,
        reclutador_id: reclutamiento.reclutador_id,
        estado_agendamiento: estadoAgendamientoNombre,
        estado_agendamiento_color: null,
        hora_sesion: reclutamiento.hora_sesion,
        fecha_asignado: reclutamiento.fecha_asignado,
        meet_link: reclutamiento.meet_link,
        participantes_id: reclutamiento.participantes_id,
        participantes_internos_id: reclutamiento.participantes_internos_id,
        participantes_friend_family_id: reclutamiento.participantes_friend_family_id,
        // Campos reales del reclutamiento
        estado_real: estadoAgendamientoNombre,
        responsable_real: responsableReal,
        implementador_real: implementadorReal,
        // Campo de observadores (obtenidos desde el libreto de la investigación)
        observadores: observadores
      };
    });

    // Esperar a que todas las promesas se resuelvan y filtrar
    const sesiones = (await Promise.all(sesionesPromises || [])).filter(sesion => sesion.fecha_programada);


    return res.status(200).json({
      sesiones,
      total: sesiones?.length || 0
    });

  } catch (error) {
    console.error('❌ Error en sesiones-reclutamiento:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

async function createSesion(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('🔄 Creando nueva sesión de reclutamiento...');
    console.log('📝 Datos recibidos:', req.body);
    
    const {
      investigacion_id,
      participantes_id,
      participantes_internos_id,
      participantes_friend_family_id,
      fecha_sesion,
      hora_sesion,
      duracion_sesion,
      reclutador_id,
      meet_link
    } = req.body;

    if (!investigacion_id || !fecha_sesion || !reclutador_id) {
      return res.status(400).json({ 
        error: 'Campos requeridos faltantes',
        details: 'Se requiere investigacion_id, fecha_sesion y reclutador_id'
      });
    }

    const tieneParticipante = participantes_id || participantes_internos_id || participantes_friend_family_id;
    if (!tieneParticipante) {
      return res.status(400).json({ 
        error: 'Participante requerido',
        details: 'Se requiere al menos un participante (participantes_id, participantes_internos_id, o participantes_friend_family_id)'
      });
    }

    const datosParaInsertar: any = {
      investigacion_id,
      fecha_sesion: new Date(fecha_sesion).toISOString(),
      hora_sesion: hora_sesion || '00:00:00',
      duracion_sesion: parseInt(duracion_sesion) || 60,
      reclutador_id,
      estado_agendamiento: '0b8723e0-4f43-455d-bd95-a9576b7beb9d',
      meet_link: meet_link || null
    };

    if (participantes_id) {
      datosParaInsertar.participantes_id = participantes_id;
    } else if (participantes_internos_id) {
      datosParaInsertar.participantes_internos_id = participantes_internos_id;
    } else if (participantes_friend_family_id) {
      datosParaInsertar.participantes_friend_family_id = participantes_friend_family_id;
    }

    console.log('📝 Datos para insertar:', datosParaInsertar);

    const { data: nuevaSesion, error: insertError } = await supabaseServer
      .from('reclutamientos')
      .insert(datosParaInsertar)
      .select('*')
      .single();

    if (insertError) {
      console.error('❌ Error insertando sesión:', insertError);
      return res.status(400).json({ 
        error: 'Error creando sesión', 
        details: insertError.message 
      });
    }

    console.log('✅ Sesión creada exitosamente:', nuevaSesion);

    return res.status(201).json({ sesion: nuevaSesion });

  } catch (error) {
    console.error('❌ Error en createSesion:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}

async function deleteSesion(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID de sesión requerido' });
  }

  try {
    console.log('🗑️ Eliminando sesión de reclutamiento:', id);

    if (!supabaseServer) {
      console.error('❌ Cliente de Supabase no disponible');
      return res.status(500).json({ error: 'Cliente de Supabase no configurado' });
    }

    // Eliminar el reclutamiento directamente
    const { error: deleteError } = await supabaseServer
      .from('reclutamientos')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error eliminando sesión de reclutamiento:', deleteError);
      return res.status(500).json({ error: 'Error eliminando sesión de reclutamiento' });
    }

    console.log('✅ Sesión de reclutamiento eliminada exitosamente:', id);
    return res.status(200).json({ message: 'Sesión de reclutamiento eliminada exitosamente' });
  } catch (error) {
    console.error('Error en DELETE sesiones-reclutamiento:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}