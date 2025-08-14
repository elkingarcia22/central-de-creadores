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
    // Usar la tabla usuarios (tabla de negocio) - CORRECTO
    console.log('🔍 Iniciando consulta a tabla usuarios...');
    
    let { data: usuarios, error } = await supabase
      .from('usuarios')
      .select(`
        id, 
        nombre, 
        correo, 
        foto_url,
        activo,
        rol_plataforma
      `)
      .order('nombre');
    
    console.log('🔍 Resultado de consulta:', { usuarios: usuarios?.length || 0, error });
    
    // Si no hay usuarios activos, mostrar todos
    if (!usuarios || usuarios.length === 0) {
      console.log('⚠️ No se encontraron usuarios, intentando sin filtro de activo...');
      
      const { data: todosUsuarios, error: errorTodos } = await supabase
        .from('usuarios')
        .select(`
          id, 
          nombre, 
          correo, 
          foto_url,
          activo,
          rol_plataforma
        `)
        .order('nombre');
      
      console.log('🔍 Usuarios sin filtro:', { usuarios: todosUsuarios?.length || 0, error: errorTodos });
      
      if (todosUsuarios && todosUsuarios.length > 0) {
        usuarios = todosUsuarios;
        error = null;
      }
    }

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
      created_at: new Date().toISOString() // Usar fecha actual como fallback
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