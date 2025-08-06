-- ====================================
-- VERIFICAR TABLA SEGUIMIENTOS_INVESTIGACION
-- ====================================

-- 1. Verificar si la tabla existe
SELECT 
    table_name,
    table_schema,
    table_type
FROM information_schema.tables 
WHERE table_name = 'seguimientos_investigacion' 
AND table_schema = 'public';

-- 2. Si existe, mostrar su estructura
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length,
    numeric_precision,
    numeric_scale,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'seguimientos_investigacion' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar foreign keys si la tabla existe
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'seguimientos_investigacion';

-- 4. Verificar índices
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'seguimientos_investigacion';

-- 5. Verificar RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    relforcerowsecurity
FROM pg_tables 
WHERE tablename = 'seguimientos_investigacion';

-- 6. Contar registros si la tabla existe
SELECT COUNT(*) as total_registros 
FROM seguimientos_investigacion; 