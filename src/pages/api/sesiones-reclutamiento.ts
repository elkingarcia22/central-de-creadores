import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'GET') {
    return await getSesiones(req, res);
  } else if (method === 'POST') {
    return await createSesion(req, res);
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

    // Obtener información del usuario actual desde los headers o query params
    const userId = req.headers['x-user-id'] as string || req.query.userId as string;
    console.log('🔄 Obteniendo sesiones de reclutamiento para usuario:', userId);

    // Verificar si el usuario es administrador
    let esAdmin = false;
    if (userId) {
      // TEMPORAL: Tratar a alison@gmail.com como administrador
      const { data: usuarioData } = await supabaseServer
        .from('usuarios_con_roles')
        .select('email, roles')
        .eq('id', userId)
        .single();
      
      // Si es alison@gmail.com, tratarlo como administrador
      if (usuarioData?.email === 'alison@gmail.com') {
        esAdmin = true;
        console.log('🔑 Usuario alison@gmail.com tratado como administrador');
      } else if (usuarioData?.roles) {
        // Verificar si tiene rol de administrador
        const { data: rolesData } = await supabaseServer
          .from('roles')
          .select('id, name')
          .in('id', usuarioData.roles);
        
        esAdmin = rolesData?.some(rol => 
          rol.name?.toLowerCase().includes('admin') || 
          rol.name?.toLowerCase().includes('administrador')
        ) || false;
      }
    }

    console.log('👤 Usuario es administrador:', esAdmin);

    let query = supabaseServer
      .from('reclutamientos')
      .select(`
        id,
        investigacion_id,
        participantes_id,
        participantes_internos_id,
        participantes_friend_family_id,
        fecha_sesion,
        hora_sesion,
        duracion_sesion,
        estado_agendamiento,
        estado_agendamiento_cat!inner(nombre),
        fecha_asignado,
        reclutador_id,
        meet_link,
        usuarios_libreto
      `);

    // Si no es administrador, filtrar por usuario
    if (!esAdmin && userId) {
      console.log('🔍 Aplicando filtros para usuario no-admin:', userId);
      
      // Obtener investigaciones donde el usuario está asignado
      const { data: investigacionesUsuario } = await supabaseServer
        .from('investigaciones')
        .select('id')
        .or(`responsable_id.eq.${userId},implementador_id.eq.${userId}`);

      const investigacionIds = investigacionesUsuario?.map(inv => inv.id) || [];
      console.log('📊 Investigaciones del usuario:', investigacionIds);

      // Obtener libretos donde el usuario está en el equipo
      const { data: libretosUsuario } = await supabaseServer
        .from('libretos_investigacion')
        .select('investigacion_id')
        .contains('usuarios_participantes', [userId]);

      const libretosInvestigacionIds = libretosUsuario?.map(lib => lib.investigacion_id) || [];
      console.log('📊 Libretos del usuario:', libretosInvestigacionIds);

      // Combinar todas las investigaciones relevantes
      const todasLasInvestigaciones = [...new Set([...investigacionIds, ...libretosInvestigacionIds])];
      console.log('📊 Todas las investigaciones relevantes:', todasLasInvestigaciones);

      if (todasLasInvestigaciones.length > 0) {
        // Filtrar reclutamientos por investigaciones relevantes O por reclutador asignado
        query = query.or(`investigacion_id.in.(${todasLasInvestigaciones.join(',')}),reclutador_id.eq.${userId}`);
      } else {
        // Si no tiene investigaciones asignadas, solo mostrar donde es reclutador
        query = query.eq('reclutador_id', userId);
      }
    }

    const { data: reclutamientos, error } = await query.order('fecha_sesion', { ascending: false });

    if (error) {
      console.error('❌ Error obteniendo reclutamientos:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('📊 Reclutamientos obtenidos:', reclutamientos?.length || 0);

    // Obtener información de participantes, reclutadores e investigaciones
    const participanteIds = new Set<string>();
    const reclutadorIds = new Set<string>();
    const investigacionIds = new Set<string>();

    reclutamientos?.forEach(reclutamiento => {
      if (reclutamiento.participantes_id) participanteIds.add(reclutamiento.participantes_id);
      if (reclutamiento.participantes_internos_id) participanteIds.add(reclutamiento.participantes_internos_id);
      if (reclutamiento.participantes_friend_family_id) participanteIds.add(reclutamiento.participantes_friend_family_id);
      if (reclutamiento.reclutador_id) reclutadorIds.add(reclutamiento.reclutador_id);
      if (reclutamiento.investigacion_id) investigacionIds.add(reclutamiento.investigacion_id);
    });

    // Obtener investigaciones
    const { data: investigaciones } = await supabaseServer
      .from('investigaciones')
      .select('id, nombre, responsable_id, implementador_id')
      .in('id', Array.from(investigacionIds));

    // Obtener participantes externos
    const { data: participantesExternos } = await supabaseServer
      .from('participantes')
      .select('id, nombre, email, tipo, rol_empresa_id, empresa_id')
      .in('id', Array.from(participanteIds));

    // Obtener participantes internos
    const { data: participantesInternos } = await supabaseServer
      .from('participantes_internos')
      .select('id, nombre, email, departamento_id')
      .in('id', Array.from(participanteIds));

    // Obtener participantes friend & family
    const { data: participantesFriendFamily } = await supabaseServer
      .from('participantes_friend_family')
      .select('id, nombre, email, departamento_id')
      .in('id', Array.from(participanteIds));

    // Obtener reclutadores
    console.log('🔍 Reclutador IDs a buscar:', Array.from(reclutadorIds));
    const { data: reclutadores, error: reclutadoresError } = await supabaseServer
      .from('usuarios_con_roles')
      .select('id, full_name, email, avatar_url')
      .in('id', Array.from(reclutadorIds));
    
    console.log('🔍 Reclutadores encontrados:', reclutadores?.length || 0);
    console.log('🔍 Error en reclutadores:', reclutadoresError);
    console.log('🔍 Primer reclutador:', reclutadores?.[0]);

    // Crear mapas para acceso rápido
    const participantesMap = new Map();
    participantesExternos?.forEach(p => participantesMap.set(p.id, { ...p, tipo: 'externo' }));
    participantesInternos?.forEach(p => participantesMap.set(p.id, { ...p, tipo: 'interno' }));
    participantesFriendFamily?.forEach(p => participantesMap.set(p.id, { ...p, tipo: 'friend_family' }));
    
    const reclutadoresMap = new Map();
    reclutadores?.forEach(r => reclutadoresMap.set(r.id, r));
    
    console.log('🔍 Mapa de reclutadores creado con', reclutadoresMap.size, 'entradas');

    const investigacionesMap = new Map();
    investigaciones?.forEach(i => investigacionesMap.set(i.id, i));

    // Formatear las sesiones
    const sesiones = reclutamientos?.map(reclutamiento => {
      // Determinar el participante
      let participante = null;
      let tipoParticipante = 'externo';
      
      if (reclutamiento.participantes_id) {
        participante = participantesMap.get(reclutamiento.participantes_id);
        tipoParticipante = 'externo';
      } else if (reclutamiento.participantes_internos_id) {
        participante = participantesMap.get(reclutamiento.participantes_internos_id);
        tipoParticipante = 'interno';
      } else if (reclutamiento.participantes_friend_family_id) {
        participante = participantesMap.get(reclutamiento.participantes_friend_family_id);
        tipoParticipante = 'friend_family';
      }

      // Determinar el estado de la sesión
      let estadoSesion = 'programada';
      const estadoNombre = Array.isArray(reclutamiento.estado_agendamiento_cat) 
        ? (reclutamiento.estado_agendamiento_cat[0] as any)?.nombre 
        : (reclutamiento.estado_agendamiento_cat as any)?.nombre;
        
      if (estadoNombre === 'Finalizado') {
        estadoSesion = 'completada';
      } else if (estadoNombre === 'En progreso') {
        estadoSesion = 'en_curso';
      } else if (estadoNombre === 'Cancelado') {
        estadoSesion = 'cancelada';
      }

      // Determinar el tipo de sesión (por defecto presencial, se puede mejorar)
      const tipoSesion = 'presencial'; // Por ahora asumimos presencial

      const investigacion = investigacionesMap.get(reclutamiento.investigacion_id);

      return {
        id: reclutamiento.id,
        titulo: `${participante?.nombre || 'Participante'} - ${investigacion?.nombre || 'Investigación'}`,
        descripcion: `Sesión de investigación con ${participante?.nombre || 'participante'} para ${investigacion?.nombre || 'investigación'}`,
        fecha_programada: reclutamiento.fecha_sesion ? new Date(reclutamiento.fecha_sesion) : null,
        duracion_minutos: reclutamiento.duracion_sesion || 60, // Usar duración real del reclutamiento
        ubicacion: 'Oficina Principal', // Ubicación por defecto
        investigacion_id: reclutamiento.investigacion_id,
        investigacion_nombre: investigacion?.nombre,
        estado: estadoSesion,
        tipo_sesion: tipoSesion,
        grabacion_permitida: true, // Por defecto permitida
        notas_publicas: `Estado: ${estadoNombre || 'Sin estado'}`,
        created_at: new Date(), // Fecha actual como fallback
        updated_at: new Date(), // Fecha actual como fallback
        
        // Información adicional del reclutamiento
        participante: participante,
        tipo_participante: tipoParticipante,
        reclutador: reclutadoresMap.get(reclutamiento.reclutador_id) || {
          id: reclutamiento.reclutador_id,
          full_name: 'Usuario no encontrado',
          email: '',
          avatar_url: ''
        },
        reclutador_id: reclutamiento.reclutador_id, // Agregar reclutador_id explícitamente
        estado_agendamiento: estadoNombre,
        estado_agendamiento_color: null, // Color no disponible en la tabla
        hora_sesion: reclutamiento.hora_sesion,
        fecha_asignado: reclutamiento.fecha_asignado,
        meet_link: reclutamiento.meet_link, // Agregar enlace de Google Meet
        
        // Campos directos de participantes para casos donde el objeto participante es null
        participantes_id: reclutamiento.participantes_id,
        participantes_internos_id: reclutamiento.participantes_internos_id,
        participantes_friend_family_id: reclutamiento.participantes_friend_family_id
      };
    }).filter(sesion => sesion.fecha_programada); // Solo sesiones con fecha programada

    console.log('✅ Sesiones formateadas:', sesiones.length);

    return res.status(200).json({
      sesiones,
      total: sesiones.length
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

    // Validar campos requeridos
    if (!investigacion_id || !fecha_sesion || !reclutador_id) {
      return res.status(400).json({ 
        error: 'Campos requeridos faltantes',
        details: 'Se requiere investigacion_id, fecha_sesion y reclutador_id'
      });
    }

    // Validar que al menos un participante esté presente
    const tieneParticipante = participantes_id || participantes_internos_id || participantes_friend_family_id;
    if (!tieneParticipante) {
      return res.status(400).json({ 
        error: 'Participante requerido',
        details: 'Se requiere al menos un participante (participantes_id, participantes_internos_id, o participantes_friend_family_id)'
      });
    }

    // Preparar datos para insertar
    const datosParaInsertar: any = {
      investigacion_id,
      fecha_sesion: new Date(fecha_sesion).toISOString(),
      hora_sesion: hora_sesion || '00:00:00',
      duracion_sesion: parseInt(duracion_sesion) || 60,
      reclutador_id,
      estado_agendamiento: '0b8723e0-4f43-455d-bd95-a9576b7beb9d', // Estado por defecto
      meet_link: meet_link || null
      // Removido created_at y updated_at - no existen en la tabla
    };

    // Agregar el participante correspondiente
    if (participantes_id) {
      datosParaInsertar.participantes_id = participantes_id;
    } else if (participantes_internos_id) {
      datosParaInsertar.participantes_internos_id = participantes_internos_id;
    } else if (participantes_friend_family_id) {
      datosParaInsertar.participantes_friend_family_id = participantes_friend_family_id;
    }

    console.log('📊 Datos para insertar:', datosParaInsertar);

    // Insertar en la base de datos
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

    // Sincronizar con Google Calendar usando Simple Sync
    try {
      console.log('🔄 Iniciando sincronización con Google Calendar (Simple Sync)...');
      const { simpleSyncCalendar } = await import('../../lib/simple-sync-calendar');
      const syncResult = await simpleSyncCalendar({
        userId: reclutador_id,
        reclutamientoId: nuevaSesion.id,
        action: 'create'
      });
      console.log('📊 Resultado de sincronización Simple Sync:', syncResult);
    } catch (syncError) {
      console.error('❌ Error en sincronización Simple Sync:', syncError);
      // No fallar la operación por error de sincronización
    }

    return res.status(201).json({ sesion: nuevaSesion });

  } catch (error) {
    console.error('❌ Error en createSesion:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
