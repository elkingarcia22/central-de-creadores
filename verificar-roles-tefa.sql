-- ====================================
-- VERIFICAR ROLES DEL USUARIO TEFA
-- ====================================
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar usuario
SELECT '=== USUARIO TEFA ===' as info;
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at
FROM auth.users 
WHERE email = 'tefa@gmail.com';

-- 2. Verificar roles asignados
SELECT '=== ROLES ASIGNADOS ===' as info;
SELECT 
    ur.user_id,
    ur.role,
    rp.nombre as nombre_rol,
    rp.id as rol_id
FROM user_roles ur
LEFT JOIN roles_plataforma rp ON ur.role = rp.id
WHERE ur.user_id IN (
    SELECT id FROM auth.users WHERE email = 'tefa@gmail.com'
);

-- 3. Verificar perfil
SELECT '=== PERFIL ===' as info;
SELECT 
    id,
    email,
    full_name,
    avatar_url
FROM profiles 
WHERE email = 'tefa@gmail.com';

-- 4. Asignar rol de administrador si no lo tiene
SELECT '=== ASIGNAR ROL ADMINISTRADOR ===' as info;

-- Insertar rol de administrador si no existe
INSERT INTO user_roles (user_id, role)
SELECT 
    (SELECT id FROM auth.users WHERE email = 'tefa@gmail.com'),
    'bcc17f6a-d751-4c39-a479-412abddde0fa' -- ID del rol administrador
WHERE NOT EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = (SELECT id FROM auth.users WHERE email = 'tefa@gmail.com')
    AND ur.role = 'bcc17f6a-d751-4c39-a479-412abddde0fa'
);

-- 5. Verificar roles después de la asignación
SELECT '=== ROLES DESPUÉS DE ASIGNACIÓN ===' as info;
SELECT 
    ur.user_id,
    ur.role,
    rp.nombre as nombre_rol,
    rp.id as rol_id
FROM user_roles ur
LEFT JOIN roles_plataforma rp ON ur.role = rp.id
WHERE ur.user_id IN (
    SELECT id FROM auth.users WHERE email = 'tefa@gmail.com'
);
