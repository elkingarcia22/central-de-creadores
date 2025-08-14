import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer as supabase } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Usar profiles y user_roles directamente para obtener datos actualizados
    console.log('🔍 Iniciando consulta a profiles y user_roles...');
    
    // Obtener todos los profiles
    let { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url, created_at, updated_at')
      .not('email', 'is', null)
      .order('full_name');

    if (profilesError) {
      console.error('Error obteniendo profiles:', profilesError);
      return res.status(500).json({ error: profilesError.message });
    }

    // Obtener todos los roles
    let { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');

    if (rolesError) {
      console.error('Error obteniendo roles:', rolesError);
      return res.status(500).json({ error: rolesError.message });
    }

    // Agrupar roles por usuario
    const rolesByUser: { [key: string]: string[] } = {};
    userRoles?.forEach(ur => {
      if (!rolesByUser[ur.user_id]) {
        rolesByUser[ur.user_id] = [];
      }
      rolesByUser[ur.user_id].push(ur.role);
    });

    // Combinar profiles con roles
    const usuarios = profiles?.map(profile => ({
      id: profile.id,
      full_name: profile.full_name,
      email: profile.email,
      avatar_url: profile.avatar_url,
      roles: rolesByUser[profile.id] || [],
      created_at: profile.created_at,
      updated_at: profile.updated_at
    })) || [];
    
    console.log('🔍 Resultado de consulta:', { usuarios: usuarios?.length || 0 });

    // Verificar que los datos están funcionando correctamente
    if (usuarios && usuarios.length > 0) {
      console.log('✅ Profiles y roles funcionando correctamente');
    }

    // Convertir datos de usuarios al formato esperado por el componente
    const usuariosFormateados = usuarios?.map(user => ({
      id: user.id,
      full_name: user.full_name || 'Sin nombre',
      email: user.email,
      avatar_url: user.avatar_url || null,
      roles: user.roles || [],
      created_at: new Date().toISOString()
    })) || [];

    // Formatear la respuesta como espera el componente
    return res.status(200).json({
      usuarios: usuariosFormateados || [],
      total: usuariosFormateados?.length || 0,
      fuente: 'profiles_y_roles',
      mensaje: 'Datos obtenidos directamente de profiles y user_roles'
    });

  } catch (error) {
    console.error('Error en /api/usuarios:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      usuarios: [],
      total: 0
    });
  }
} 