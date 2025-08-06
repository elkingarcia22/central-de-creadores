-- ====================================
-- VERIFICAR TABLA ROLES_EMPRESA
-- ====================================

-- 1. Verificar si la tabla existe
SELECT 
    'Tabla roles_empresa:' as info,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles_empresa') 
        THEN 'EXISTE' 
        ELSE 'NO EXISTE' 
    END as estado;

-- 2. Verificar estructura de la tabla
SELECT 
    'Estructura de roles_empresa:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'roles_empresa' 
ORDER BY ordinal_position;

-- 3. Verificar cantidad de registros
SELECT 
    'Cantidad de registros:' as info,
    COUNT(*) as total_registros
FROM roles_empresa;

-- 4. Mostrar algunos registros de ejemplo
SELECT 
    'Primeros 10 registros:' as info,
    id,
    nombre,
    descripcion,
    created_at
FROM roles_empresa 
ORDER BY nombre 
LIMIT 10;

-- 5. Verificar si hay registros activos
SELECT 
    'Registros activos:' as info,
    COUNT(*) as total_activos
FROM roles_empresa 
WHERE activo = true;

-- 6. Verificar permisos RLS
SELECT 
    'Estado RLS:' as info,
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity = true THEN 'HABILITADO' 
        ELSE 'DESHABILITADO' 
    END as rls_estado
FROM pg_tables 
WHERE tablename = 'roles_empresa';

-- 7. Verificar políticas RLS
SELECT 
    'Políticas RLS:' as info,
    policyname,
    cmd,
    permissive,
    qual
FROM pg_policies 
WHERE tablename = 'roles_empresa';

-- 8. Verificar si el usuario actual puede leer la tabla
SELECT 
    'Prueba de lectura:' as info,
    'Usuario actual puede leer roles_empresa' as resultado;

-- Intentar leer un registro como el usuario actual
SELECT 
    'Lectura como usuario actual:' as info,
    COUNT(*) as registros_visibles
FROM roles_empresa; 