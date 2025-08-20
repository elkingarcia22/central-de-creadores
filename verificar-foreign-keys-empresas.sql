-- =====================================================
-- VERIFICAR FOREIGN KEYS DE LA TABLA EMPRESAS
-- =====================================================

-- 1. VER ESTRUCTURA COMPLETA DE EMPRESAS
-- =====================================================
SELECT 
    'ESTRUCTURA EMPRESAS' as seccion,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'empresas' 
ORDER BY ordinal_position;

-- 2. VER FOREIGN KEYS DE EMPRESAS
-- =====================================================
SELECT 
    'FOREIGN KEYS EMPRESAS' as seccion,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'empresas';

-- 3. VER QUÉ TABLA TIENE KAMS REALMENTE
-- =====================================================
SELECT 
    'TABLAS CON KAM' as seccion,
    table_name,
    column_name
FROM information_schema.columns 
WHERE column_name LIKE '%kam%' 
    OR column_name LIKE '%KAM%'
ORDER BY table_name, column_name;

-- 4. VER SI EXISTE UNA TABLA KAMS SEPARADA
-- =====================================================
SELECT 
    'TABLA KAMS EXISTE' as seccion,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'kams'
    ) as existe_tabla_kams;
