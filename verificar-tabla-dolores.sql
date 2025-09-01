-- ====================================
-- VERIFICAR ESTADO DE TABLA DE DOLORES
-- ====================================

-- 1. Verificar si la tabla existe
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'dolores_participantes';

-- 2. Verificar estructura de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'dolores_participantes'
ORDER BY ordinal_position;

-- 3. Verificar políticas RLS
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
WHERE tablename = 'dolores_participantes';

-- 4. Verificar si RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'dolores_participantes';

-- 5. Verificar datos existentes
SELECT 
    COUNT(*) as total_dolores,
    estado,
    COUNT(*) as cantidad_por_estado
FROM dolores_participantes 
GROUP BY estado;

-- 6. Verificar un dolor específico (reemplazar con el ID real)
-- SELECT * FROM dolores_participantes WHERE id = '0800e5a1-34cb-4c92-b401-44102a2d7726';

-- 7. Verificar permisos del usuario actual
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'dolores_participantes';

-- 8. Verificar triggers
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'dolores_participantes';
