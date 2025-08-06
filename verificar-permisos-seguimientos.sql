-- ====================================
-- VERIFICAR PERMISOS TABLA SEGUIMIENTOS_INVESTIGACION
-- ====================================

-- 1. VERIFICAR PERMISOS ACTUALES
SELECT 'PERMISOS ACTUALES' as info;

SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'seguimientos_investigacion'
AND table_schema = 'public'
ORDER BY grantee, privilege_type;

-- 2. CONCEDER PERMISOS A ROLES AUTENTICADOS
SELECT 'CONCEDIENDO PERMISOS' as info;

-- Conceder permisos a authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE seguimientos_investigacion TO authenticated;

-- Conceder permisos a service_role
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE seguimientos_investigacion TO service_role;

-- Conceder permisos a anon (si es necesario)
GRANT SELECT ON TABLE seguimientos_investigacion TO anon;

-- 3. VERIFICAR PERMISOS DESPUÉS DE LA CORRECCIÓN
SELECT 'PERMISOS DESPUÉS DE CORRECCIÓN' as info;

SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'seguimientos_investigacion'
AND table_schema = 'public'
ORDER BY grantee, privilege_type;

-- 4. VERIFICAR RLS
SELECT 'VERIFICAR RLS' as info;

SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'seguimientos_investigacion';

-- 5. VERIFICAR POLÍTICAS RLS
SELECT 'VERIFICAR POLÍTICAS RLS' as info;

SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'seguimientos_investigacion';

-- 6. PROBAR INSERCIÓN DESPUÉS DE CORREGIR PERMISOS
SELECT 'PRUEBA INSERCIÓN' as info;

-- Primero verificar si hay investigaciones y usuarios disponibles
SELECT 
    'INVESTIGACIONES DISPONIBLES' as info,
    COUNT(*) as total
FROM investigaciones;

SELECT 
    'USUARIOS DISPONIBLES' as info,
    COUNT(*) as total
FROM profiles;

-- 7. VERIFICAR USUARIO ACTUAL
SELECT 
    'USUARIO ACTUAL' as info,
    auth.uid() as user_id,
    auth.role() as user_role,
    auth.email() as user_email;

-- 8. PROBAR CONSULTA SIMPLE
SELECT 
    'PRUEBA CONSULTA' as info,
    COUNT(*) as total_seguimientos
FROM seguimientos_investigacion; 