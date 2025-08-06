-- ====================================
-- VERIFICAR RLS DEPARTAMENTOS
-- ====================================
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Verificar si RLS está habilitado
SELECT '=== RLS HABILITADO ===' as info;

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename = 'departamentos';

-- PASO 2: Verificar políticas RLS
SELECT '=== POLÍTICAS RLS ===' as info;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'departamentos';

-- PASO 3: Verificar permisos de usuario
SELECT '=== PERMISOS DE USUARIO ===' as info;

SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'departamentos'
AND table_schema = 'public';

-- PASO 4: Probar consulta directa sin RLS
SELECT '=== PRUEBA CONSULTA DIRECTA ===' as info;

-- Esta consulta debería funcionar si no hay RLS
SELECT COUNT(*) as total_departamentos
FROM departamentos;

SELECT id, nombre, categoria, orden, activo
FROM departamentos 
WHERE activo = true
ORDER BY orden, nombre
LIMIT 5; 