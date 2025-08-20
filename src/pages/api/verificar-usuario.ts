import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../src/api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de usuario requerido' });
  }

  try {
    console.log('🔍 Verificando usuario:', id);

    // 1. Verificar en profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .eq('id', id)
      .single();

    console.log('📊 Resultado profiles:', { data: profileData, error: profileError });

    // 2. Verificar en usuarios_con_roles
    const { data: vistaData, error: vistaError } = await supabase
      .from('usuarios_con_roles')
      .select('id, full_name, email, avatar_url, roles')
      .eq('id', id)
      .single();

    console.log('📊 Resultado usuarios_con_roles:', { data: vistaData, error: vistaError });

    // 3. Verificar en usuarios
    const { data: usuariosData, error: usuariosError } = await supabase
      .from('usuarios')
      .select('id, nombre, correo, activo')
      .eq('id', id)
      .single();

    console.log('📊 Resultado usuarios:', { data: usuariosData, error: usuariosError });

    // 4. Verificar roles asignados
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role_id')
      .eq('user_id', id);

    console.log('📊 Resultado user_roles:', { data: rolesData, error: rolesError });

    // 5. Verificar roles disponibles
    const { data: rolesDisponibles, error: rolesDisponiblesError } = await supabase
      .from('roles')
      .select('id, name, description')
      .order('name');

    console.log('📊 Resultado roles disponibles:', { data: rolesDisponibles, error: rolesDisponiblesError });

    // 6. Verificar usuarios con roles de reclutador o administrador
    const { data: usuariosConRoles, error: usuariosConRolesError } = await supabase
      .from('usuarios_con_roles')
      .select('id, full_name, email, roles')
      .or('roles::text.ilike.%reclutador%,roles::text.ilike.%administrador%,roles::text.ilike.%admin%')
      .order('full_name');

    console.log('📊 Resultado usuarios con roles reclutador/admin:', { data: usuariosConRoles, error: usuariosConRolesError });

    return res.status(200).json({
      usuario_id: id,
      profiles: { data: profileData, error: profileError },
      usuarios_con_roles: { data: vistaData, error: vistaError },
      usuarios: { data: usuariosData, error: usuariosError },
      user_roles: { data: rolesData, error: rolesError },
      roles_disponibles: { data: rolesDisponibles, error: rolesDisponiblesError },
      usuarios_con_roles_reclutador_admin: { data: usuariosConRoles, error: usuariosConRolesError }
    });

  } catch (error) {
    console.error('❌ Error verificando usuario:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
