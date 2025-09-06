import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../api/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔍 Consultando usuarios...');
    
    // Consultar directamente profiles para obtener datos actualizados
    // Luego enriquecer con roles desde user_roles
    let { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .order('full_name');
    
    console.log('📊 Resultado consulta profiles:');
    console.log('- Data:', data);
    console.log('- Error:', error);
    console.log('- Count:', data ? data.length : 0);
    
    if (data && data.length > 0) {
      // Enriquecer con roles desde user_roles
      console.log('🔍 Enriqueciendo con roles desde user_roles...');
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesData && !rolesError) {
        // Crear un mapa de roles por usuario
        const rolesMap = new Map();
        rolesData.forEach(role => {
          if (!rolesMap.has(role.user_id)) {
            rolesMap.set(role.user_id, []);
          }
          rolesMap.get(role.user_id).push(role.role);
        });
        
        // Agregar roles a cada usuario
        data = data.map(user => ({
          ...user,
          roles: rolesMap.get(user.id) || []
        }));
        
        console.log('✅ Roles agregados a usuarios');
      } else {
        console.log('⚠️ Error obteniendo roles:', rolesError);
        // Agregar roles vacíos si no se pueden obtener
        data = data.map(user => ({
          ...user,
          roles: []
        }));
      }
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