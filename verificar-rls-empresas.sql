-- ====================================
-- VERIFICAR Y CORREGIR RLS EN EMPRESAS
-- ====================================

-- 1. VERIFICAR RLS ACTUAL
SELECT '=== RLS ACTUAL ===' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_activo
FROM pg_tables 
WHERE tablename = 'empresas';

-- 2. VERIFICAR POLÍTICAS ACTUALES
SELECT '=== POLÍTICAS ACTUALES ===' as info;
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'empresas';

-- 3. DESHABILITAR RLS TEMPORALMENTE
SELECT '=== DESHABILITANDO RLS ===' as info;
ALTER TABLE empresas DISABLE ROW LEVEL SECURITY;

-- 4. VERIFICAR QUE RLS ESTÁ DESHABILITADO
SELECT '=== VERIFICAR RLS DESHABILITADO ===' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_activo
FROM pg_tables 
WHERE tablename = 'empresas';

-- 5. VERIFICAR PERMISOS DE LECTURA
SELECT '=== PERMISOS DE LECTURA ===' as info;
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'empresas' 
AND table_schema = 'public'
AND privilege_type = 'SELECT';

-- 6. CONCEDER PERMISOS SI ES NECESARIO
SELECT '=== CONCEDIENDO PERMISOS ===' as info;
GRANT SELECT ON empresas TO anon;
GRANT SELECT ON empresas TO authenticated;

-- 7. VERIFICAR DATOS DESPUÉS DE DESHABILITAR RLS
SELECT '=== VERIFICAR DATOS ===' as info;
SELECT COUNT(*) as total_empresas FROM empresas;

SELECT '=== EMPRESAS DISPONIBLES ===' as info;
SELECT id, nombre FROM empresas ORDER BY nombre;

-- 8. MENSAJE FINAL
SELECT '✅ RLS deshabilitado y permisos configurados' as resultado; 