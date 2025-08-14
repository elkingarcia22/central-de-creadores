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
    // Usar la tabla usuarios directamente (no profiles)
    let { data: usuarios, error } = await supabase
      .from('usuarios')
      .select(`
        id, 
        nombre, 
        correo, 
        foto_url,
        activo,
        rol_plataforma,
        created_at
      `)
      .eq('activo', true)
      .order('nombre');

    if (error) {
      console.error('Error obteniendo usuarios:', error);
      return res.status(500).json({ error: error.message });
    }

    // Convertir datos de usuarios al formato esperado por el componente
    const usuariosFormateados = usuarios?.map(user => ({
      id: user.id,
      full_name: user.nombre || 'Sin nombre',
      email: user.correo,
      avatar_url: user.foto_url,
      roles: user.rol_plataforma ? [user.rol_plataforma] : [],
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