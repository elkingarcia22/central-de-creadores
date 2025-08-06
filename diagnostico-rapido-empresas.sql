-- ====================================
-- DIAGNÓSTICO RÁPIDO EMPRESAS
-- ====================================

-- 1. VERIFICAR SI HAY EMPRESAS
SELECT '=== ¿HAY EMPRESAS? ===' as info;
SELECT COUNT(*) as total_empresas FROM empresas;

-- 2. VERIFICAR EMPRESAS CON NOMBRE
SELECT '=== EMPRESAS CON NOMBRE ===' as info;
SELECT id, nombre FROM empresas ORDER BY nombre;

-- 3. VERIFICAR SI LA TABLA ESTÁ VACÍA
SELECT '=== ¿TABLA VACÍA? ===' as info;
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN 'SÍ - No hay empresas'
        ELSE 'NO - Hay ' || COUNT(*) || ' empresas'
    END as estado_tabla
FROM empresas;

-- 4. VERIFICAR PERMISOS BÁSICOS
SELECT '=== PERMISOS BÁSICOS ===' as info;
SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_name = 'empresas' 
AND table_schema = 'public';

-- 5. VERIFICAR RLS
SELECT '=== RLS ACTIVADO? ===' as info;
SELECT 
    rowsecurity as rls_activo
FROM pg_tables 
WHERE tablename = 'empresas';

-- 6. MENSAJE FINAL
SELECT '✅ Diagnóstico rápido completado' as resultado; 