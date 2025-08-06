-- ====================================
-- VERIFICAR ESTRUCTURA SIMPLE DE ROLES_EMPRESA
-- ====================================

-- 1. Verificar si la tabla existe
SELECT 
    'EXISTENCIA DE TABLA' as categoria,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles_empresa') 
        THEN 'TABLA EXISTE' 
        ELSE 'TABLA NO EXISTE' 
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
    nombre
FROM roles_empresa 
ORDER BY nombre 
LIMIT 10;

-- 5. Verificar estado de RLS
SELECT 
    'ESTADO RLS' as categoria,
    tablename,
    CASE 
        WHEN rowsecurity = true THEN 'HABILITADO' 
        ELSE 'DESHABILITADO' 
    END as rls_estado
FROM pg_tables 
WHERE tablename = 'roles_empresa';

-- 6. Probar consulta simple
SELECT 
    'PRUEBA DE CONSULTA' as categoria,
    id,
    nombre
FROM roles_empresa 
ORDER BY nombre 
LIMIT 5;

-- 7. Mostrar todos los roles disponibles
SELECT 
    'TODOS LOS ROLES' as categoria,
    id,
    nombre
FROM roles_empresa 
ORDER BY nombre; 