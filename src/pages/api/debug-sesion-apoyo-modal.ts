import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔍 [DEBUG] Obteniendo sesiones de apoyo para debug del modal...');
    
    const { data, error } = await supabase
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
      .order('fecha_programada', { ascending: true });

    if (error) {
      console.error('❌ [DEBUG] Error obteniendo sesiones de apoyo:', error);
      return res.status(500).json({ error: 'Error obteniendo sesiones de apoyo' });
    }

    console.log('📊 [DEBUG] Sesiones de apoyo obtenidas:', data?.length || 0);

    // Función para obtener información del participante
    const obtenerParticipante = (sesion: any) => {
      console.log('🔍 [DEBUG] Analizando participante para sesión:', sesion.id);
      console.log('🔍 [DEBUG] sesion.participantes:', sesion.participantes);
      console.log('🔍 [DEBUG] sesion.participantes_internos:', sesion.participantes_internos);
      console.log('🔍 [DEBUG] sesion.participantes_friend_family:', sesion.participantes_friend_family);
      
      if (sesion.participantes) {
        console.log('✅ [DEBUG] Usando participante externo');
        return {
          id: sesion.participantes.id,
          nombre: sesion.participantes.nombre,
          email: sesion.participantes.email,
          tipo: 'externo' as const
        };
      } else if (sesion.participantes_internos) {
        console.log('✅ [DEBUG] Usando participante interno');
        return {
          id: sesion.participantes_internos.id,
          nombre: sesion.participantes_internos.nombre,
          email: sesion.participantes_internos.email,
          tipo: 'interno' as const
        };
      } else if (sesion.participantes_friend_family) {
        console.log('✅ [DEBUG] Usando participante friend_family');
        return {
          id: sesion.participantes_friend_family.id,
          nombre: sesion.participantes_friend_family.nombre,
          email: sesion.participantes_friend_family.email,
          tipo: 'friend_family' as const
        };
      }
      
      console.log('❌ [DEBUG] No se encontró participante');
      return null;
    };

    // Formatear las sesiones para debug
    const sesionesFormateadas = data?.map(sesion => {
      const participante = obtenerParticipante(sesion);
      
      const sesionFormateada = {
        id: sesion.id,
        titulo: sesion.titulo,
        descripcion: sesion.descripcion,
        fecha_programada: sesion.fecha_programada,
        hora_sesion: sesion.hora_sesion,
        duracion_minutos: sesion.duracion_minutos,
        estado: sesion.estado,
        estado_agendamiento: sesion.estado === 'programada' ? 'Pendiente' : 
                           sesion.estado === 'en_curso' ? 'En progreso' : 
                           sesion.estado === 'completada' ? 'Finalizado' : 'Cancelado',
        estado_real: sesion.estado === 'programada' ? 'Pendiente' : 
                    sesion.estado === 'en_curso' ? 'En progreso' : 
                    sesion.estado === 'completada' ? 'Finalizado' : 'Cancelado',
        moderador_id: sesion.moderador_id,
        moderador_nombre: sesion.profiles?.full_name || 'Sin asignar',
        moderador_email: sesion.profiles?.email || '',
        responsable_real: sesion.profiles?.full_name || 'Sin asignar',
        implementador_real: sesion.profiles?.full_name || 'Sin asignar',
        observadores: sesion.observadores || [],
        objetivo_sesion: sesion.objetivo_sesion,
        meet_link: sesion.meet_link,
        tipo: 'apoyo',
        // Campos de participantes
        participantes_id: sesion.participantes_id,
        participantes_internos_id: sesion.participantes_internos_id,
        participantes_friend_family_id: sesion.participantes_friend_family_id,
        participante: participante,
        created_at: sesion.created_at,
        updated_at: sesion.updated_at,
        // Datos raw para debug
        _debug: {
          raw_participantes: sesion.participantes,
          raw_participantes_internos: sesion.participantes_internos,
          raw_participantes_friend_family: sesion.participantes_friend_family,
          raw_profiles: sesion.profiles
        }
      };
      
      console.log('🔍 [DEBUG] Sesión formateada:', {
        id: sesionFormateada.id,
        titulo: sesionFormateada.titulo,
        participante: sesionFormateada.participante,
        participantes_id: sesionFormateada.participantes_id,
        participantes_internos_id: sesionFormateada.participantes_internos_id,
        participantes_friend_family_id: sesionFormateada.participantes_friend_family_id
      });
      
      return sesionFormateada;
    }) || [];

    console.log('✅ [DEBUG] Sesiones de apoyo formateadas para debug:', sesionesFormateadas.length);

    return res.status(200).json({
      sesiones: sesionesFormateadas,
      total: sesionesFormateadas.length,
      debug_info: {
        total_raw: data?.length || 0,
        con_participante: sesionesFormateadas.filter(s => s.participante !== null).length,
        con_participantes_id: sesionesFormateadas.filter(s => s.participantes_id !== null).length,
        con_participantes_internos_id: sesionesFormateadas.filter(s => s.participantes_internos_id !== null).length,
        con_participantes_friend_family_id: sesionesFormateadas.filter(s => s.participantes_friend_family_id !== null).length
      }
    });
  } catch (error) {
    console.error('❌ [DEBUG] Error en debug-sesion-apoyo-modal:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
