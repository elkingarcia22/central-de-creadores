-- ====================================
-- DIAGNÓSTICO COMPLETO - ROLES EMPRESA
-- ====================================

-- 1. VERIFICAR QUE LA TABLA EXISTE
SELECT 
    '🔍 VERIFICACIÓN DE TABLA' as categoria,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles_empresa') 
        THEN '✅ TABLA EXISTE' 
        ELSE '❌ TABLA NO EXISTE' 
    END as estado;

-- 2. VERIFICAR ESTRUCTURA DE LA TABLA
SELECT 
    '📋 ESTRUCTURA DE TABLA' as categoria,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'roles_empresa' 
ORDER BY ordinal_position;

-- 3. VERIFICAR ESTADO DE RLS
SELECT 
    '🔒 ESTADO RLS' as categoria,
    tablename,
    CASE 
        WHEN rowsecurity = true THEN '❌ HABILITADO (PROBLEMA)' 
        ELSE '✅ DESHABILITADO (OK)' 
    END as rls_estado
FROM pg_tables 
WHERE tablename = 'roles_empresa';

-- 4. VERIFICAR POLÍTICAS EXISTENTES
SELECT 
    '📜 POLÍTICAS RLS' as categoria,
    policyname,
    cmd,
    permissive,
    qual
FROM pg_policies 
WHERE tablename = 'roles_empresa';

-- 5. CONTAR REGISTROS TOTALES
SELECT 
    '📊 CANTIDAD DE REGISTROS' as categoria,
    COUNT(*) as total_registros
FROM roles_empresa;

-- 6. MOSTRAR PRIMEROS 10 REGISTROS
SELECT 
    '📝 PRIMEROS 10 REGISTROS' as categoria,
    id,
    nombre,
    activo,
    created_at
FROM roles_empresa 
ORDER BY nombre 
LIMIT 10;

-- 7. VERIFICAR REGISTROS ACTIVOS
SELECT 
    '✅ REGISTROS ACTIVOS' as categoria,
    COUNT(*) as total_activos
FROM roles_empresa 
WHERE activo = true;

-- 8. VERIFICAR USUARIO ACTUAL
SELECT 
    '👤 USUARIO ACTUAL' as categoria,
    auth.uid() as user_id,
    auth.email() as email,
    auth.role() as role;

-- 9. PROBAR CONSULTA DIRECTA (LA QUE USA LA API)
SELECT 
    '🔍 CONSULTA API SIMULADA' as categoria,
    id,
    nombre
FROM roles_empresa 
ORDER BY nombre;

-- 10. VERIFICAR SI HAY ERRORES DE PERMISOS
DO $$
BEGIN
    BEGIN
        PERFORM COUNT(*) FROM roles_empresa;
        RAISE NOTICE '✅ CONSULTA EXITOSA: Se puede acceder a roles_empresa';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ ERROR DE CONSULTA: %', SQLERRM;
    END;
END $$;

-- 11. VERIFICAR OTRAS TABLAS DE CATÁLOGOS
SELECT 'industrias' as tabla, COUNT(*) as registros FROM industrias
UNION ALL
SELECT 'paises' as tabla, COUNT(*) as registros FROM paises
UNION ALL
SELECT 'tamano_empresa' as tabla, COUNT(*) as registros FROM tamano_empresa
UNION ALL
SELECT 'plataformas_cat' as tabla, COUNT(*) as registros FROM plataformas_cat
UNION ALL
SELECT 'modalidades' as tabla, COUNT(*) as registros FROM modalidades;

-- 12. VERIFICAR NOMBRES DE COLUMNAS EXACTOS
SELECT 
    '🏷️ NOMBRES DE COLUMNAS' as categoria,
    column_name,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'roles_empresa' 
ORDER BY ordinal_position; 