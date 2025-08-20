import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { investigacion_id } = req.query;

    if (!investigacion_id || typeof investigacion_id !== 'string') {
      return res.status(400).json({ error: 'ID de investigación requerido' });
    }

    console.log('🔍 Consultando actividades para investigación:', investigacion_id);

    // Obtener actividades de la investigación (sin join por ahora)
    const { data: actividades, error: actividadesError } = await supabase
      .from('log_actividades_investigacion')
      .select('*')
      .eq('investigacion_id', investigacion_id)
      .order('fecha_creacion', { ascending: false });

    if (actividadesError) {
      console.error('Error al obtener actividades:', actividadesError);
      return res.status(500).json({ error: 'Error al obtener actividades: ' + actividadesError.message });
    }

    console.log('📊 Actividades encontradas:', actividades?.length || 0);

    // Si no hay actividades, retornar array vacío
    if (!actividades || actividades.length === 0) {
      return res.status(200).json([]);
    }

    // Obtener información de usuarios para las actividades
    const usuarioIds = [...new Set(actividades.map(a => a.usuario_id).filter(Boolean))];
    let usuarios: any[] = [];

    if (usuarioIds.length > 0) {
      // Usar profiles directamente en lugar de la vista usuarios_con_roles
      const { data: usuariosData, error: usuariosError } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', usuarioIds);

      if (usuariosError) {
        console.error('Error al obtener usuarios:', usuariosError);
      } else {
        usuarios = usuariosData || [];
        console.log('✅ Usuarios obtenidos para actividades:', usuarios.length);
      }
    }

    // Transformar los datos para el frontend
    const actividadesFormateadas = actividades.map(actividad => {
      const usuario = usuarios.find(u => u.id === actividad.usuario_id);
      
      return {
        id: actividad.id,
        investigacion_id: actividad.investigacion_id,
        tipo_actividad: actividad.tipo_actividad,
        descripcion: actividad.descripcion,
        cambios: actividad.cambios,
        usuario_id: actividad.usuario_id,
        fecha_creacion: actividad.fecha_creacion,
        usuario: usuario ? {
          full_name: usuario.full_name,
          email: usuario.email,
          avatar_url: usuario.avatar_url
        } : null
      };
    });

    console.log('✅ Actividades formateadas:', actividadesFormateadas.length);
    return res.status(200).json(actividadesFormateadas);

  } catch (error) {
    console.error('Error en API actividades-investigacion:', error);
    return res.status(500).json({ error: 'Error interno del servidor: ' + (error as Error).message });
  }
} 