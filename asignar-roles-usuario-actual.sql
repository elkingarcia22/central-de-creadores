-- ====================================
-- ASIGNAR ROLES AL USUARIO ACTUAL
-- ====================================

-- 1. VERIFICAR USUARIO ACTUAL
SELECT 
    'Usuario actual:' as info,
    auth.uid() as user_id,
    auth.email() as email;

-- 2. VERIFICAR SI EXISTEN LAS TABLAS NECESARIAS
SELECT 
    'Verificando tablas necesarias:' as info,
    table_name,
    'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'user_roles', 'roles_plataforma')
ORDER BY table_name;

-- 3. VERIFICAR ROLES DISPONIBLES EN LA PLATAFORMA
SELECT 
    'Roles disponibles en la plataforma:' as info,
    id,
    nombre,
    descripcion
FROM roles_plataforma
ORDER BY nombre;

-- 4. VERIFICAR PERFIL DEL USUARIO ACTUAL
SELECT 
    'Perfil del usuario actual:' as info,
    id,
    email,
    full_name,
    created_at
FROM profiles 
WHERE id = auth.uid();

-- 5. VERIFICAR ROLES ACTUALES DEL USUARIO
SELECT 
    'Roles actuales del usuario:' as info,
    ur.role,
    rp.nombre as rol_plataforma,
    ur.created_at
FROM user_roles ur
LEFT JOIN roles_plataforma rp ON ur.role = rp.nombre
WHERE ur.user_id = auth.uid();

-- 6. INSERTAR ROLES SI NO EXISTEN

-- Asegurar que el usuario tenga el rol de administrador
INSERT INTO user_roles (user_id, role)
SELECT auth.uid(), 'administrador'
WHERE auth.uid() IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'administrador'
);

-- Asegurar que el usuario tenga el rol de investigador
INSERT INTO user_roles (user_id, role)
SELECT auth.uid(), 'investigador'
WHERE auth.uid() IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'investigador'
);

-- 7. VERIFICAR QUE LOS ROLES SE ASIGNARON CORRECTAMENTE
SELECT 
    'Roles del usuario después de la asignación:' as resultado,
    ur.role,
    rp.nombre as rol_plataforma,
    ur.created_at,
    'NUEVO' as status
FROM user_roles ur
LEFT JOIN roles_plataforma rp ON ur.role = rp.nombre
WHERE ur.user_id = auth.uid()
ORDER BY ur.created_at DESC;

-- 8. CREAR FUNCIÓN HELPER PARA FUTUROS USUARIOS (OPCIONAL)
CREATE OR REPLACE FUNCTION asignar_roles_basicos_usuario(usuario_id UUID)
RETURNS TEXT AS $$
BEGIN
    -- Insertar rol administrador si no existe
    INSERT INTO user_roles (user_id, role)
    SELECT usuario_id, 'administrador'
    WHERE NOT EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = usuario_id 
        AND role = 'administrador'
    );
    
    -- Insertar rol investigador si no existe
    INSERT INTO user_roles (user_id, role)
    SELECT usuario_id, 'investigador'
    WHERE NOT EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = usuario_id 
        AND role = 'investigador'
    );
    
    RETURN 'Roles asignados correctamente';
END;
$$ LANGUAGE plpgsql;

-- COMENTARIO: Para usar la función con cualquier usuario:
-- SELECT asignar_roles_basicos_usuario('uuid-del-usuario');

-- 9. VERIFICACIÓN FINAL - DEBERÍA MOSTRAR LOS DOS ROLES
SELECT 
    'VERIFICACIÓN FINAL:' as titulo,
    COUNT(*) as total_roles,
    STRING_AGG(role, ', ') as roles_asignados
FROM user_roles 
WHERE user_id = auth.uid();

-- ====================================
-- INSTRUCCIONES:
-- ====================================
-- 1. Ejecuta este script completo en el SQL Editor de Supabase
-- 2. Asegúrate de estar autenticado en Supabase cuando lo ejecutes
-- 3. Después de ejecutarlo, recarga la página de la aplicación
-- 4. El problema de "acceso denegado" debería estar resuelto
-- ==================================== 