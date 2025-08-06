-- ====================================
-- VERIFICAR ESTRUCTURA ACTUAL DE ROLES_EMPRESA
-- ====================================

-- 1. Verificar si la tabla existe
SELECT 
    'EXISTENCIA DE TABLA' as categoria,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles_empresa') 
        THEN '✅ TABLA EXISTE' 
        ELSE '❌ TABLA NO EXISTE' 
    END as estado;

-- 2. Mostrar estructura completa de la tabla
SELECT 
    'ESTRUCTURA DE COLUMNAS' as categoria,
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'roles_empresa' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Contar registros totales
SELECT 
    'CANTIDAD DE REGISTROS' as categoria,
    COUNT(*) as total_registros
FROM roles_empresa;

-- 4. Mostrar primeros 10 registros
SELECT 
    'PRIMEROS 10 REGISTROS' as categoria,
    id,
    nombre,
    activo,
    created_at
FROM roles_empresa 
ORDER BY nombre 
LIMIT 10;

-- 5. Verificar estado de RLS
SELECT 
    'ESTADO RLS' as categoria,
    tablename,
    CASE 
        WHEN rowsecurity = true THEN '❌ HABILITADO' 
        ELSE '✅ DESHABILITADO' 
    END as rls_estado
FROM pg_tables 
WHERE tablename = 'roles_empresa';

-- 6. Mostrar políticas RLS si existen
SELECT 
    'POLÍTICAS RLS' as categoria,
    policyname,
    cmd,
    permissive,
    qual
FROM pg_policies 
WHERE tablename = 'roles_empresa';

-- 7. Verificar índices
SELECT 
    'ÍNDICES' as categoria,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'roles_empresa';

-- 8. Probar consulta simple
SELECT 
    'PRUEBA DE CONSULTA' as categoria,
    id,
    nombre
FROM roles_empresa 
ORDER BY nombre 
LIMIT 5;

-- 9. Verificar si hay registros activos
SELECT 
    'REGISTROS ACTIVOS' as categoria,
    COUNT(*) as total_activos
FROM roles_empresa 
WHERE activo = true;

-- 10. Mostrar estadísticas básicas
SELECT 
    'ESTADÍSTICAS BÁSICAS' as categoria,
    'Total registros' as tipo,
    COUNT(*) as cantidad
FROM roles_empresa 
UNION ALL
SELECT 
    'ESTADÍSTICAS BÁSICAS' as categoria,
    'Registros activos' as tipo,
    COUNT(*) as cantidad
FROM roles_empresa 
WHERE activo = true; 