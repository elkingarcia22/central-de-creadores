// Script de prueba para verificar la creación de usuarios
// Ejecutar en la consola del navegador en la página de gestión de usuarios

async function testUsuarioCreation() {
  console.log('🧪 Iniciando prueba de creación de usuario...');
  
  try {
    // 1. Verificar que la tabla profiles existe y está accesible
    console.log('1️⃣ Verificando tabla profiles...');
    const { data: profilesTest, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Error accediendo a profiles:', profilesError);
      return false;
    }
    console.log('✅ Tabla profiles accesible');
    
    // 2. Verificar que la tabla roles_plataforma existe y tiene datos
    console.log('2️⃣ Verificando tabla roles_plataforma...');
    const { data: rolesTest, error: rolesError } = await supabase
      .from('roles_plataforma')
      .select('id, nombre');
    
    if (rolesError) {
      console.error('❌ Error accediendo a roles_plataforma:', rolesError);
      return false;
    }
    
    if (!rolesTest || rolesTest.length === 0) {
      console.error('❌ No hay roles disponibles en roles_plataforma');
      return false;
    }
    
    console.log('✅ Roles disponibles:', rolesTest.map(r => r.nombre));
    
    // 3. Verificar que la tabla user_roles existe
    console.log('3️⃣ Verificando tabla user_roles...');
    const { data: userRolesTest, error: userRolesError } = await supabase
      .from('user_roles')
      .select('count')
      .limit(1);
    
    if (userRolesError) {
      console.error('❌ Error accediendo a user_roles:', userRolesError);
      return false;
    }
    console.log('✅ Tabla user_roles accesible');
    
    // 4. Verificar bucket de avatares
    console.log('4️⃣ Verificando bucket de avatares...');
    const { data: bucketTest, error: bucketError } = await supabase.storage
      .from('avatars')
      .list('', { limit: 1 });
    
    if (bucketError) {
      console.error('❌ Error accediendo al bucket avatars:', bucketError);
      return false;
    }
    console.log('✅ Bucket avatars accesible');
    
    // 5. Probar creación de usuario (sin avatar)
    console.log('5️⃣ Probando creación de usuario...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testNombre = 'Usuario de Prueba';
    const testRoles = [rolesTest[0].id]; // Usar el primer rol disponible
    
    const response = await fetch('/api/crear-usuario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: testNombre,
        email: testEmail,
        roles: testRoles
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ Error creando usuario:', result);
      return false;
    }
    
    console.log('✅ Usuario creado exitosamente:', result);
    
    // 6. Verificar que el usuario aparece en profiles
    console.log('6️⃣ Verificando que el usuario aparece en profiles...');
    const { data: newProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', testEmail)
      .single();
    
    if (profileError || !newProfile) {
      console.error('❌ Usuario no encontrado en profiles:', profileError);
      return false;
    }
    
    console.log('✅ Usuario encontrado en profiles:', newProfile);
    
    // 7. Verificar que los roles fueron asignados
    console.log('7️⃣ Verificando asignación de roles...');
    const { data: userRoles, error: userRolesError2 } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', newProfile.id);
    
    if (userRolesError2) {
      console.error('❌ Error verificando roles del usuario:', userRolesError2);
      return false;
    }
    
    console.log('✅ Roles asignados al usuario:', userRoles);
    
    // 8. Limpiar usuario de prueba
    console.log('8️⃣ Limpiando usuario de prueba...');
    await supabase.from('user_roles').delete().eq('user_id', newProfile.id);
    await supabase.from('profiles').delete().eq('id', newProfile.id);
    
    // Intentar eliminar de Auth (puede fallar si no tienes permisos de admin)
    try {
      await supabase.auth.admin.deleteUser(newProfile.id);
      console.log('✅ Usuario eliminado de Auth');
    } catch (authError) {
      console.log('⚠️ No se pudo eliminar de Auth (normal si no eres admin):', authError.message);
    }
    
    console.log('🎉 ¡Todas las pruebas pasaron exitosamente!');
    return true;
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
    return false;
  }
}

// Función para ejecutar la prueba
function runTest() {
  console.log('🚀 Ejecutando pruebas del sistema de usuarios...');
  testUsuarioCreation().then(success => {
    if (success) {
      console.log('🎯 Sistema funcionando correctamente');
    } else {
      console.log('💥 Hay problemas en el sistema');
    }
  });
}

// Ejecutar automáticamente si estamos en la página correcta
if (typeof supabase !== 'undefined') {
  console.log('📋 Para ejecutar las pruebas, escribe: runTest()');
} else {
  console.log('❌ Supabase no está disponible. Asegúrate de estar en la página correcta.');
} 