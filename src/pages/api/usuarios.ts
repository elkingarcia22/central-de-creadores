import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer as supabase } from '../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Usar la vista usuarios_con_roles (ahora basada en usuarios)
    console.log('🔍 Iniciando consulta a vista usuarios_con_roles (consistente)...');
    
    let { data: usuarios, error } = await supabase
      .from('usuarios_con_roles')
      .select(`
        id, 
        full_name, 
        email, 
        avatar_url,
        roles
      `)
      .order('full_name');
    
    console.log('🔍 Resultado de consulta:', { usuarios: usuarios?.length || 0, error });

    if (error) {
      console.error('Error obteniendo usuarios:', error);
      return res.status(500).json({ error: error.message });
    }

    // Verificar que la vista está funcionando correctamente
    if (usuarios && usuarios.length > 0) {
      console.log('✅ Vista usuarios_con_roles funcionando correctamente');
    }

    // Convertir datos de usuarios al formato esperado por el componente
    const usuariosFormateados = usuarios?.map(user => ({
      id: user.id,
      full_name: user.full_name || 'Sin nombre',
      email: user.email,
      avatar_url: user.avatar_url,
      roles: user.roles || [],
      created_at: new Date().toISOString()
    })) || [];

    // Formatear la respuesta como espera el componente
    return res.status(200).json({
      usuarios: usuariosFormateados || [],
      total: usuariosFormateados?.length || 0,
      fuente: 'usuarios_con_roles',
      mensaje: 'Vista consistente basada en tabla usuarios'
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