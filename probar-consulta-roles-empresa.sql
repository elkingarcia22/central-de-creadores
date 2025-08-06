-- ====================================
-- PROBAR CONSULTA ROLES_EMPRESA
-- ====================================

-- 1. CONTAR REGISTROS TOTALES
SELECT 'Total de registros en roles_empresa:' as info, COUNT(*) as total FROM roles_empresa;

-- 2. VERIFICAR ESTADO DE RLS
SELECT 
    'Estado RLS:' as info,
    tablename,
    CASE 
        WHEN rowsecurity = true THEN 'HABILITADO ❌' 
        ELSE 'DESHABILITADO ✅' 
    END as rls_estado
FROM pg_tables 
WHERE tablename = 'roles_empresa';

-- 3. VERIFICAR POLÍTICAS RLS
SELECT 
    'Políticas RLS:' as info,
    COUNT(*) as total_politicas
FROM pg_policies 
WHERE tablename = 'roles_empresa';

-- 4. MOSTRAR POLÍTICAS ESPECÍFICAS
SELECT 
    'Detalle de políticas:' as info,
    policyname,
    cmd,
    permissive,
    qual
FROM pg_policies 
WHERE tablename = 'roles_empresa';

-- 5. PROBAR CONSULTA SIMPLE
SELECT 'Consulta simple:' as info, id, nombre FROM roles_empresa LIMIT 5;

-- 6. PROBAR CONSULTA CON ORDER BY (LA QUE USA LA API)
SELECT 'Consulta con ORDER BY:' as info, id, nombre FROM roles_empresa ORDER BY nombre LIMIT 5;

-- 7. VERIFICAR COLUMNAS EXACTAS
SELECT 
    'Columnas de la tabla:' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'roles_empresa' 
ORDER BY ordinal_position;

-- 8. PROBAR CONSULTA CON SELECT *
SELECT 'Consulta con SELECT *:' as info, * FROM roles_empresa LIMIT 3;

-- 9. VERIFICAR USUARIO ACTUAL Y PERMISOS
SELECT 
    'Usuario actual:' as info,
    auth.uid() as user_id,
    auth.email() as email,
    auth.role() as role;

-- 10. PROBAR CONSULTA COMO ANON
SET ROLE anon;
SELECT 'Como usuario anon:' as info, COUNT(*) as total FROM roles_empresa;
RESET ROLE;

-- 11. PROBAR CONSULTA COMO AUTHENTICATED
SET ROLE authenticated;
SELECT 'Como usuario authenticated:' as info, COUNT(*) as total FROM roles_empresa;
RESET ROLE;

-- 12. VERIFICAR SI HAY REGISTROS CON COLUMNA activo
SELECT 'Registros activos:' as info, COUNT(*) as total FROM roles_empresa WHERE activo = true;

-- 13. VERIFICAR SI HAY REGISTROS SIN FILTROS
SELECT 'Registros sin filtros:' as info, COUNT(*) as total FROM roles_empresa WHERE 1=1;

-- 14. MOSTRAR ESTRUCTURA COMPLETA DE UN REGISTRO
SELECT 'Estructura de un registro:' as info, * FROM roles_empresa LIMIT 1; 