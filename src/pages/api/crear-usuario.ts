import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🔍 API recibió request body:', req.body);
    console.log('🔍 API recibió headers:', req.headers);
    
    const { email, full_name, avatar_url, roles } = req.body;

    console.log('🔍 Datos extraídos:', { email, full_name, avatar_url, roles });

    // Validar datos requeridos
    if (!email || !full_name) {
      console.log('❌ Validación falló:', { email: !!email, full_name: !!full_name });
      return res.status(400).json({ error: 'Email y nombre completo son requeridos' });
    }

    console.log('🚀 Creando usuario en API:', { email, full_name, roles });

    // Crear el usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: 'tempPassword123!', // Contraseña temporal
      email_confirm: true,
      user_metadata: {
        full_name
      }
    });

    if (authError) {
      console.error('Error creando usuario en Auth:', authError);
      
      // Manejar caso específico de email ya existente
      if (authError.message.includes('already been registered')) {
        return res.status(400).json({ 
          error: 'Ya existe un usuario con este email. Por favor, usa un email diferente.' 
        });
      }
      
      return res.status(400).json({ error: 'Error creando usuario: ' + authError.message });
    }

    if (!authData.user) {
      return res.status(400).json({ error: 'No se pudo crear el usuario' });
    }

    console.log('✅ Usuario creado en Auth:', authData.user.id);

    // Crear el perfil manualmente si no existe
    console.log('🔧 Creando perfil manualmente...');
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: authData.user.id,
      full_name,
      email: authData.user.email,
      avatar_url: avatar_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'id'
    });

    if (profileError) {
      console.error('Error creando/actualizando perfil:', profileError);
      return res.status(400).json({ error: 'Error creando perfil: ' + profileError.message });
    }

    console.log('✅ Perfil creado/actualizado exitosamente');

    if (profileError) {
      console.error('Error actualizando perfil:', profileError);
      return res.status(400).json({ error: 'Error actualizando perfil: ' + profileError.message });
    }

    console.log('✅ Perfil actualizado');

    // Crear también en la tabla usuarios para mantener la FK de reclutamientos
    console.log('🔧 Creando usuario en tabla usuarios para FK...');
    const { error: usuariosError } = await supabase.from('usuarios').upsert({
      id: authData.user.id,
      nombre: full_name,
      correo: authData.user.email,
      foto_url: avatar_url || null,
      activo: true,
      rol_plataforma: roles && roles.length > 0 ? roles[0] : null
    }, {
      onConflict: 'id'
    });

    if (usuariosError) {
      console.error('Error creando/actualizando usuario en tabla usuarios:', usuariosError);
      // No fallar aquí, solo log del error
      console.log('⚠️ Usuario creado en profiles pero no en usuarios (FK puede fallar)');
    } else {
      console.log('✅ Usuario creado en tabla usuarios');
    }

    // Asignar roles al usuario
    if (roles && roles.length > 0) {
      console.log('🔐 Asignando roles:', roles);
      
      const rolesToInsert = roles.map((rolId: string) => ({
        user_id: authData.user.id,
        role: rolId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error: insertRolesError } = await supabase.from('user_roles').insert(rolesToInsert);
      if (insertRolesError) {
        console.error('Error insertando roles:', insertRolesError);
        return res.status(400).json({ error: 'Error insertando roles: ' + insertRolesError.message });
      }

      console.log('✅ Roles asignados:', roles);
    }

    console.log('✅ Usuario creado exitosamente');
    return res.status(200).json({ 
      success: true, 
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name
      }
    });

  } catch (error) {
    console.error('Error en API crear-usuario:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor: ' + (error instanceof Error ? error.message : 'Error desconocido') 
    });
  }
} 