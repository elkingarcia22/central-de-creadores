import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Obtener todos los roles disponibles
    const { data: roles, error: rolesError } = await supabase
      .from('roles_plataforma')
      .select('*');

    if (rolesError) {
      console.error('Error obteniendo roles:', rolesError);
      return res.status(500).json({ error: 'Error obteniendo roles' });
    }

    // Obtener todos los user_roles existentes
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('*');

    if (userRolesError) {
      console.error('Error obteniendo user_roles:', userRolesError);
      return res.status(500).json({ error: 'Error obteniendo user_roles' });
    }

    return res.status(200).json({
      roles: roles,
      userRoles: userRoles,
      message: 'Roles obtenidos exitosamente'
    });

  } catch (error) {
    console.error('Error en debug-roles:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
