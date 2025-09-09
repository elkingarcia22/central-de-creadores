import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    if (!supabaseServer) {
      console.error('❌ Cliente de Supabase no disponible');
      return res.status(500).json({ error: 'Cliente de Supabase no configurado' });
    }

    console.log('🔄 Obteniendo todas las sesiones de reclutamiento...');

    // Obtener todos los reclutamientos con información completa
    const { data: reclutamientos, error } = await supabaseServer
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
        meet_link
      `)
      .order('fecha_sesion', { ascending: false });

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
    const { data: reclutadores } = await supabaseServer
      .from('usuarios')
      .select('id, full_name, email')
      .in('id', Array.from(reclutadorIds));
    
    console.log('🔍 Reclutadores encontrados:', reclutadores?.length || 0);
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
      if (reclutamiento.estado_agendamiento_cat?.nombre === 'Finalizado') {
        estadoSesion = 'completada';
      } else if (reclutamiento.estado_agendamiento_cat?.nombre === 'En progreso') {
        estadoSesion = 'en_curso';
      } else if (reclutamiento.estado_agendamiento_cat?.nombre === 'Cancelado') {
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
        duracion_minutos: 60, // Duración por defecto, se puede obtener de la configuración
        ubicacion: 'Oficina Principal', // Ubicación por defecto
        investigacion_id: reclutamiento.investigacion_id,
        investigacion_nombre: investigacion?.nombre,
        estado: estadoSesion,
        tipo_sesion: tipoSesion,
        grabacion_permitida: true, // Por defecto permitida
        notas_publicas: `Estado: ${reclutamiento.estado_agendamiento_cat?.nombre || 'Sin estado'}`,
        created_at: new Date(), // Fecha actual como fallback
        updated_at: new Date(), // Fecha actual como fallback
        
        // Información adicional del reclutamiento
        participante: participante,
        tipo_participante: tipoParticipante,
        reclutador: reclutadoresMap.get(reclutamiento.reclutador_id),
        reclutador_id: reclutamiento.reclutador_id, // Agregar reclutador_id explícitamente
        estado_agendamiento: reclutamiento.estado_agendamiento_cat?.nombre,
        estado_agendamiento_color: null, // Color no disponible en la tabla
        hora_sesion: reclutamiento.hora_sesion,
        fecha_asignado: reclutamiento.fecha_asignado,
        meet_link: reclutamiento.meet_link // Agregar enlace de Google Meet
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
