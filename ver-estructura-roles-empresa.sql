-- ====================================
-- VER ESTRUCTURA REAL DE ROLES_EMPRESA
-- ====================================

-- 1. Ver todas las columnas de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'roles_empresa' 
ORDER BY ordinal_position;

-- 2. Contar registros totales
SELECT 'Total registros:' as info, COUNT(*) as total FROM roles_empresa;

-- 3. Ver algunos registros de ejemplo
SELECT * FROM roles_empresa LIMIT 5;

-- 4. Verificar estado de RLS
SELECT 
    'Estado RLS:' as info,
    tablename,
    CASE 
        WHEN rowsecurity = true THEN 'HABILITADO ❌' 
        ELSE 'DESHABILITADO ✅' 
    END as rls_estado
FROM pg_tables 
WHERE tablename = 'roles_empresa'; 