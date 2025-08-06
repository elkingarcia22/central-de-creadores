// Script de prueba para verificar la eliminación de usuarios
// Ejecutar en la consola del navegador en la página de gestión de usuarios

async function testUserDeletion() {
  console.log('🧪 Iniciando prueba de eliminación de usuario...');
  
  try {
    // 1. Crear un usuario de prueba
    console.log('1️⃣ Creando usuario de prueba...');
    const testEmail = `test-delete-${Date.now()}@example.com`;
    const testNombre = 'Usuario para Eliminar';
    
    // Obtener un rol disponible
    const { data: roles } = await supabase.from('roles_plataforma').select('id').limit(1);
    if (!roles || roles.length === 0) {
      console.error('❌ No hay roles disponibles');
      return false;
    }
    
    const testRoles = [roles[0].id];
    
    const createResponse = await fetch('/api/crear-usuario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: testNombre,
        email: testEmail,
        roles: testRoles
      })
    });
    
    if (!createResponse.ok) {
      console.error('❌ Error creando usuario de prueba');
      return false;
    }
    
    console.log('✅ Usuario de prueba creado');
    
    // 2. Buscar el usuario creado
    console.log('2️⃣ Buscando usuario creado...');
    const { data: userProfile, error: findError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', testEmail)
      .single();
    
    if (findError || !userProfile) {
      console.error('❌ No se pudo encontrar el usuario creado:', findError);
      return false;
    }
    
    console.log('✅ Usuario encontrado:', userProfile);
    
    // 3. Eliminar el usuario
    console.log('3️⃣ Eliminando usuario...');
    const deleteResponse = await fetch(`/api/eliminar-usuario?userId=${userProfile.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    
    const deleteResult = await deleteResponse.json();
    
    if (!deleteResponse.ok) {
      console.error('❌ Error eliminando usuario:', deleteResult);
      return false;
    }
    
    console.log('✅ Usuario eliminado exitosamente:', deleteResult);
    
    // 4. Verificar que el usuario ya no existe en profiles
    console.log('4️⃣ Verificando que el usuario no existe en profiles...');
    const { data: userAfterDelete, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', testEmail)
      .single();
    
    if (userAfterDelete) {
      console.error('❌ El usuario aún existe en profiles después de eliminarlo');
      return false;
    }
    
    console.log('✅ Usuario no existe en profiles (correcto)');
    
    // 5. Verificar que no hay roles asociados
    console.log('5️⃣ Verificando que no hay roles asociados...');
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userProfile.id);
    
    if (userRoles && userRoles.length > 0) {
      console.error('❌ Aún hay roles asociados al usuario eliminado');
      return false;
    }
    
    console.log('✅ No hay roles asociados (correcto)');
    
    console.log('🎉 ¡Prueba de eliminación completada exitosamente!');
    return true;
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
    return false;
  }
}

// Función para ejecutar la prueba
function runDeleteTest() {
  console.log('🚀 Ejecutando prueba de eliminación de usuarios...');
  testUserDeletion().then(success => {
    if (success) {
      console.log('🎯 Eliminación de usuarios funcionando correctamente');
    } else {
      console.log('💥 Hay problemas con la eliminación de usuarios');
    }
  });
}

// Ejecutar automáticamente si estamos en la página correcta
if (typeof supabase !== 'undefined') {
  console.log('📋 Para ejecutar la prueba de eliminación, escribe: runDeleteTest()');
} else {
  console.log('❌ Supabase no está disponible. Asegúrate de estar en la página correcta.');
} 