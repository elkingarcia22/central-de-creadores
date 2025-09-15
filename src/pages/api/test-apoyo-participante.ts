import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🧪 [TEST] Creando sesión de apoyo de prueba con participante...');
    
    const {
      titulo,
      descripcion,
      fecha_programada,
      hora_sesion,
      duracion_minutos,
      moderador_id,
      observadores,
      objetivo_sesion,
      participantes_id,
      participantes_internos_id,
      participantes_friend_family_id,
      meet_link
    } = req.body;

    console.log('🧪 [TEST] Datos recibidos:', {
      titulo,
      descripcion,
      fecha_programada,
      hora_sesion,
      duracion_minutos,
      moderador_id,
      observadores,
      objetivo_sesion,
      participantes_id,
      participantes_internos_id,
      participantes_friend_family_id,
      meet_link
    });

    if (!titulo || !fecha_programada || !duracion_minutos || !moderador_id) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: titulo, fecha_programada, duracion_minutos, moderador_id'
      });
    }

    // Verificar que el participante existe si se proporciona
    if (participantes_id) {
      const { data: participante, error: participanteError } = await supabase
        .from('participantes')
        .select('id, nombre, email')
        .eq('id', participantes_id)
        .single();

      if (participanteError || !participante) {
        console.error('❌ [TEST] Error verificando participante externo:', participanteError);
        return res.status(400).json({ error: 'Participante externo no encontrado' });
      }
      
      console.log('✅ [TEST] Participante externo verificado:', participante);
    }

    if (participantes_internos_id) {
      const { data: participante, error: participanteError } = await supabase
        .from('participantes_internos')
        .select('id, nombre, email')
        .eq('id', participantes_internos_id)
        .single();

      if (participanteError || !participante) {
        console.error('❌ [TEST] Error verificando participante interno:', participanteError);
        return res.status(400).json({ error: 'Participante interno no encontrado' });
      }
      
      console.log('✅ [TEST] Participante interno verificado:', participante);
    }

    if (participantes_friend_family_id) {
      const { data: participante, error: participanteError } = await supabase
        .from('participantes_friend_family')
        .select('id, nombre, email')
        .eq('id', participantes_friend_family_id)
        .single();

      if (participanteError || !participante) {
        console.error('❌ [TEST] Error verificando participante friend_family:', participanteError);
        return res.status(400).json({ error: 'Participante friend_family no encontrado' });
      }
      
      console.log('✅ [TEST] Participante friend_family verificado:', participante);
    }

    const { data: sesion, error: sesionError } = await supabase
      .from('sesiones_apoyo')
      .insert({
        titulo,
        descripcion,
        fecha_programada: new Date(fecha_programada).toISOString(),
        hora_sesion,
        duracion_minutos: parseInt(duracion_minutos),
        moderador_id,
        observadores: observadores || [],
        objetivo_sesion,
        meet_link,
        estado: 'programada',
        // Campos de participantes
        participantes_id: participantes_id || null,
        participantes_internos_id: participantes_internos_id || null,
        participantes_friend_family_id: participantes_friend_family_id || null
      })
      .select()
      .single();

    if (sesionError) {
      console.error('❌ [TEST] Error creando sesión de apoyo:', sesionError);
      return res.status(500).json({ error: 'Error creando sesión de apoyo' });
    }

    console.log('✅ [TEST] Sesión de apoyo creada exitosamente:', sesion);

    // Ahora obtener la sesión con los JOINs para verificar que se guardó correctamente
    const { data: sesionCompleta, error: errorCompleta } = await supabase
      .from('sesiones_apoyo')
      .select(`
        *,
        profiles!sesiones_apoyo_moderador_id_fkey(
          id,
          full_name,
          email
        ),
        participantes!sesiones_apoyo_participantes_id_fkey(
          id,
          nombre,
          email
        ),
        participantes_internos!sesiones_apoyo_participantes_internos_id_fkey(
          id,
          nombre,
          email
        ),
        participantes_friend_family!sesiones_apoyo_participantes_friend_family_id_fkey(
          id,
          nombre,
          email
        )
      `)
      .eq('id', sesion.id)
      .single();

    if (errorCompleta) {
      console.error('❌ [TEST] Error obteniendo sesión completa:', errorCompleta);
      return res.status(500).json({ error: 'Error obteniendo sesión completa' });
    }

    console.log('✅ [TEST] Sesión completa obtenida:', sesionCompleta);

    // Función para obtener información del participante
    const obtenerParticipante = (sesion: any) => {
      if (sesion.participantes) {
        return {
          id: sesion.participantes.id,
          nombre: sesion.participantes.nombre,
          email: sesion.participantes.email,
          tipo: 'externo' as const
        };
      } else if (sesion.participantes_internos) {
        return {
          id: sesion.participantes_internos.id,
          nombre: sesion.participantes_internos.nombre,
          email: sesion.participantes_internos.email,
          tipo: 'interno' as const
        };
      } else if (sesion.participantes_friend_family) {
        return {
          id: sesion.participantes_friend_family.id,
          nombre: sesion.participantes_friend_family.nombre,
          email: sesion.participantes_friend_family.email,
          tipo: 'friend_family' as const
        };
      }
      return null;
    };

    const participante = obtenerParticipante(sesionCompleta);

    const sesionFormateada = {
      id: sesionCompleta.id,
      titulo: sesionCompleta.titulo,
      descripcion: sesionCompleta.descripcion,
      fecha_programada: sesionCompleta.fecha_programada,
      hora_sesion: sesionCompleta.hora_sesion,
      duracion_minutos: sesionCompleta.duracion_minutos,
      estado: sesionCompleta.estado,
      estado_agendamiento: 'Pendiente',
      estado_real: 'Pendiente',
      moderador_id: sesionCompleta.moderador_id,
      moderador_nombre: sesionCompleta.profiles?.full_name || 'Sin asignar',
      moderador_email: sesionCompleta.profiles?.email || '',
      responsable_real: sesionCompleta.profiles?.full_name || 'Sin asignar',
      implementador_real: sesionCompleta.profiles?.full_name || 'Sin asignar',
      observadores: sesionCompleta.observadores || [],
      objetivo_sesion: sesionCompleta.objetivo_sesion,
      meet_link: sesionCompleta.meet_link,
      tipo: 'apoyo',
      // Campos de participantes
      participantes_id: sesionCompleta.participantes_id,
      participantes_internos_id: sesionCompleta.participantes_internos_id,
      participantes_friend_family_id: sesionCompleta.participantes_friend_family_id,
      participante: participante,
      created_at: sesionCompleta.created_at,
      updated_at: sesionCompleta.updated_at
    };

    console.log('✅ [TEST] Sesión formateada para respuesta:', sesionFormateada);

    return res.status(201).json({
      message: 'Sesión de apoyo creada exitosamente',
      sesion: sesionFormateada,
      debug: {
        participante_encontrado: participante !== null,
        participante_data: participante,
        raw_sesion: sesionCompleta
      }
    });
  } catch (error) {
    console.error('❌ [TEST] Error en test-apoyo-participante:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
