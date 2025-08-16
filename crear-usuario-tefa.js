// ====================================
// CREAR USUARIO TEFA@GMAIL.COM
// ====================================
// Ejecutar con: node crear-usuario-tefa.js

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function crearUsuarioTefa() {
  try {
    console.log('🔐 Creando usuario tefa@gmail.com...');
    
    // 1. Crear el usuario en auth.users
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
      return;
    }

    console.log('✅ Usuario creado en auth:', authData.user.id);

    // 2. Asignar rol de administrador
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
      return;
    }

    console.log('✅ Rol asignado correctamente');

    // 3. Crear perfil en profiles
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
      return;
    }

    console.log('✅ Perfil creado correctamente');

    console.log('🎉 Usuario tefa@gmail.com creado exitosamente!');
    console.log('📧 Email: tefa@gmail.com');
    console.log('🔑 Contraseña: 123456');
    console.log('👤 Rol: Administrador');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar la función
crearUsuarioTefa();
