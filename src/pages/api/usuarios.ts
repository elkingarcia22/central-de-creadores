import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Intentar usar la vista usuarios_con_roles primero
    let { data: usuarios, error } = await supabase
      .from('usuarios_con_roles')
      .select(`
        id, 
        full_name, 
        email, 
        avatar_url,
        roles,
        created_at
      `)
      .order('full_name');

    // Si la vista no existe, usar la tabla profiles directamente
    if (error && error.message.includes('does not exist')) {
      console.log('Vista usuarios_con_roles no existe, usando tabla profiles');
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id, 
          full_name, 
          email, 
          avatar_url,
          rol_text,
          role,
          created_at
        `)
        .order('full_name');

      if (profilesError) {
        console.error('Error obteniendo usuarios de profiles:', profilesError);
        return res.status(500).json({ error: profilesError.message });
      }

      // Convertir datos de profiles al formato esperado
      usuarios = profilesData?.map(user => ({
        ...user,
        roles: user.role ? [user.role] : (user.rol_text ? [user.rol_text] : [])
      })) || [];
    } else if (error) {
      console.error('Error obteniendo usuarios:', error);
      return res.status(500).json({ error: error.message });
    }

    // Formatear la respuesta como espera el componente
    return res.status(200).json({
      usuarios: usuarios || [],
      total: usuarios?.length || 0
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