-- ====================================
-- VERIFICAR USUARIO TEFA@GMAIL.COM
-- ====================================
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si el usuario existe
SELECT '=== VERIFICAR USUARIO TEFA@GMAIL.COM ===' as info;
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at,
    email_confirmed_at
FROM auth.users 
WHERE email = 'tefa@gmail.com';

-- 2. Verificar roles del usuario
SELECT '=== ROLES DEL USUARIO ===' as info;
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

-- 3. Verificar si el usuario tiene contraseña
SELECT '=== VERIFICAR CONTRASEÑA ===' as info;
SELECT 
    id,
    email,
    encrypted_password IS NOT NULL as tiene_password,
    CASE 
        WHEN encrypted_password IS NOT NULL THEN '✅ Tiene contraseña'
        ELSE '❌ No tiene contraseña'
    END as estado_password
FROM auth.users 
WHERE email = 'tefa@gmail.com';

-- 4. Crear o actualizar el usuario si no existe
SELECT '=== CREAR/ACTUALIZAR USUARIO ===' as info;

-- Insertar usuario si no existe (esto debe hacerse desde la aplicación)
-- Por ahora solo verificamos
SELECT 
    CASE 
        WHEN EXISTS(SELECT 1 FROM auth.users WHERE email = 'tefa@gmail.com') 
        THEN '✅ Usuario existe'
        ELSE '❌ Usuario no existe - debe crearse desde la aplicación'
    END as estado_usuario;
