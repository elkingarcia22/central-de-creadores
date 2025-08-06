-- ====================================
-- VERIFICAR PERMISOS DE TABLA EMPRESAS
-- ====================================

-- 1. VERIFICAR SI LA TABLA EXISTE
SELECT '=== VERIFICAR EXISTENCIA DE TABLA ===' as info;
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'empresas' 
    AND table_schema = 'public'
) as tabla_empresas_existe;

-- 2. VERIFICAR PERMISOS DE LECTURA
SELECT '=== VERIFICAR PERMISOS DE LECTURA ===' as info;
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'empresas' 
AND table_schema = 'public'
AND privilege_type = 'SELECT';

-- 3. VERIFICAR RLS (Row Level Security)
SELECT '=== VERIFICAR RLS ===' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'empresas';

-- 4. VERIFICAR POLÍTICAS RLS
SELECT '=== VERIFICAR POLÍTICAS RLS ===' as info;
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
WHERE tablename = 'empresas';

-- 5. VERIFICAR SI HAY DATOS
SELECT '=== VERIFICAR DATOS ===' as info;
SELECT COUNT(*) as total_empresas FROM empresas;

-- 6. VERIFICAR ESTRUCTURA DE COLUMNAS
SELECT '=== VERIFICAR ESTRUCTURA ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'empresas' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. MENSAJE DE CONFIRMACIÓN
SELECT '✅ Verificación de permisos completada' as resultado; 