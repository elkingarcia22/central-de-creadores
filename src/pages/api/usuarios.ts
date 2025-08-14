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
    // Usar la tabla profiles (Supabase Auth) con roles
    let { data: usuarios, error } = await supabase
      .from('profiles')
      .select(`
        id, 
        full_name, 
        email, 
        avatar_url,
        created_at
      `)
      .order('full_name');

    if (error) {
      console.error('Error obteniendo usuarios:', error);
      return res.status(500).json({ error: error.message });
    }

    // Convertir datos de usuarios al formato esperado por el componente
    const usuariosFormateados = usuarios?.map(user => ({
      id: user.id,
      full_name: user.full_name || 'Sin nombre',
      email: user.email,
      avatar_url: user.avatar_url,
      roles: [], // Por ahora sin roles, se pueden agregar después si es necesario
      created_at: user.created_at
    })) || [];

    // Formatear la respuesta como espera el componente
    return res.status(200).json({
      usuarios: usuariosFormateados || [],
      total: usuariosFormateados?.length || 0
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