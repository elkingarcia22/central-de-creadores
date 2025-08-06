-- ====================================
-- VERIFICAR ESQUEMA DE TABLA LIBRETOS_INVESTIGACION
-- ====================================

-- 1. VERIFICAR SI LA TABLA EXISTE
SELECT 
    table_name,
    table_schema,
    table_type
FROM information_schema.tables 
WHERE table_name = 'libretos_investigacion' 
AND table_schema = 'public';

-- 2. ESTRUCTURA COMPLETA DE LA TABLA
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
WHERE table_name = 'libretos_investigacion' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. VERIFICAR FOREIGN KEYS
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
    AND tc.table_name = 'libretos_investigacion';

-- 4. VERIFICAR ÍNDICES
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'libretos_investigacion';

-- 5. VERIFICAR RLS (Row Level Security)
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    relforcerowsecurity
FROM pg_tables 
WHERE tablename = 'libretos_investigacion';

-- 6. VERIFICAR POLÍTICAS RLS
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
WHERE tablename = 'libretos_investigacion';

-- 7. CONTEO DE REGISTROS
SELECT COUNT(*) as total_registros 
FROM libretos_investigacion;

-- 8. VERIFICAR TABLAS RELACIONADAS
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'plataformas_cat',
    'tipos_prueba_cat', 
    'roles_empresa',
    'industrias',
    'modalidades',
    'tamano_empresa',
    'investigaciones'
)
ORDER BY table_name; 