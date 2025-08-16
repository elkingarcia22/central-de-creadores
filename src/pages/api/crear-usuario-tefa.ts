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
    console.log('🔐 Creando usuario tefa@gmail.com...');
    
    // 1. Verificar si el usuario ya existe
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userExists = existingUser.users.find(user => user.email === 'tefa@gmail.com');
    
    if (userExists) {
      console.log('⚠️ Usuario ya existe, actualizando contraseña...');
      
      // Actualizar contraseña del usuario existente
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        userExists.id,
        { password: '123456' }
      );

      if (updateError) {
        console.error('❌ Error actualizando contraseña:', updateError);
        return res.status(500).json({ error: 'Error actualizando contraseña' });
      }

      console.log('✅ Contraseña actualizada correctamente');
      return res.status(200).json({ 
        message: 'Usuario existente, contraseña actualizada',
        user: updateData.user 
      });
    }

    // 2. Crear el usuario en auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'tefa@gmail.com',
      password: '123456',
      email_confirm: true,
      user_metadata: {
        full_name: 'Tefa Usuario'
      }
    });

    if (authError) {
      console.error('❌ Error creando usuario:', authError);
      return res.status(500).json({ error: 'Error creando usuario' });
    }

    console.log('✅ Usuario creado en auth:', authData.user.id);

    // 3. Asignar rol de administrador
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .insert([
        {
          user_id: authData.user.id,
          role: 'bcc17f6a-d751-4c39-a479-412abddde0fa' // ID del rol administrador
        }
      ]);

    if (roleError) {
      console.error('❌ Error asignando rol:', roleError);
      // No retornar error aquí, el usuario ya se creó
    } else {
      console.log('✅ Rol asignado correctamente');
    }

    // 4. Crear perfil en profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          email: 'tefa@gmail.com',
          full_name: 'Tefa Usuario',
          avatar_url: null
        }
      ]);

    if (profileError) {
      console.error('❌ Error creando perfil:', profileError);
      // No retornar error aquí, el usuario ya se creó
    } else {
      console.log('✅ Perfil creado correctamente');
    }

    console.log('🎉 Usuario tefa@gmail.com creado exitosamente!');

    return res.status(200).json({
      message: 'Usuario creado exitosamente',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name: 'Tefa Usuario',
        role: 'Administrador'
      },
      credentials: {
        email: 'tefa@gmail.com',
        password: '123456'
      }
    });

  } catch (error) {
    console.error('❌ Error general:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
