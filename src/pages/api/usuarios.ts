import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔍 Consultando usuarios...');
    
    // Consultar directamente usuarios_con_roles para obtener todos los usuarios disponibles
    // Esto incluye usuarios que pueden no estar en profiles pero sí en otras tablas
    let { data, error } = await supabase
      .from('usuarios_con_roles')
      .select('id, full_name, email, avatar_url, roles')
      .order('full_name');
    
    console.log('📊 Resultado consulta usuarios_con_roles:');
    console.log('- Data:', data);
    console.log('- Error:', error);
    console.log('- Count:', data ? data.length : 0);
    
    // Si no hay datos en usuarios_con_roles, intentar con profiles como fallback
    if (!data || data.length === 0) {
      console.log('🔍 No hay datos en usuarios_con_roles, intentando con profiles...');
      const { data: dataProfiles, error: errorProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .order('full_name');
      
      data = dataProfiles;
      error = errorProfiles;
      
      console.log('📊 Resultado consulta profiles:');
      console.log('- Data:', data);
      console.log('- Error:', error);
      console.log('- Count:', data ? data.length : 0);
    }
    
    // Si aún no hay datos, intentar con la tabla usuarios original
    if (!data || data.length === 0) {
      console.log('🔍 No hay datos en usuarios_con_roles, intentando con tabla usuarios...');
      const { data: dataUsuarios, error: errorUsuarios } = await supabase
        .from('usuarios')
        .select('id, nombre, correo, activo')
        .order('nombre');
      
      data = dataUsuarios;
      error = errorUsuarios;
      
      console.log('📊 Resultado consulta usuarios:');
      console.log('- Data:', data);
      console.log('- Error:', error);
      console.log('- Count:', data ? data.length : 0);
    }

    console.log('📊 Resultado consulta usuarios:');
    console.log('- Data:', data);
    console.log('- Error:', error);
    console.log('- Count:', data ? data.length : 0);

    if (error) {
      console.error('❌ Error obteniendo usuarios:', error);
      return res.status(500).json({ error: 'Error al obtener usuarios' });
    }

    console.log('✅ Devolviendo usuarios:', data?.length || 0);
    
    // Formatear los datos para que sean consistentes
    const usuariosFormateados = data?.map(usuario => ({
      id: usuario.id,
      full_name: usuario.full_name || usuario.nombre || 'Sin nombre',
      email: usuario.email || usuario.correo || 'sin-email@ejemplo.com',
      avatar_url: usuario.avatar_url || null,
      roles: usuario.roles || []
    })) || [];
    
    console.log('✅ Usuarios formateados:', usuariosFormateados.length);
    console.log('✅ Usuarios con roles:', usuariosFormateados.filter(u => u.roles && u.roles.length > 0).length);
    console.log('✅ Usuarios sin roles:', usuariosFormateados.filter(u => !u.roles || u.roles.length === 0).length);
    
    // Incluir también usuarios sin roles específicos para que puedan ser asignados como responsables
    console.log('✅ Incluyendo usuarios sin roles para permitir asignación como responsables');
    
    console.log('✅ Usuarios formateados:', usuariosFormateados.length);
    return res.status(200).json({ usuarios: usuariosFormateados });
  } catch (error) {
    console.error('❌ Error en la API:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
} 