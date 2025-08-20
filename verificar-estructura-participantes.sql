-- ====================================
-- VERIFICAR ESTRUCTURA DE TABLAS DE PARTICIPANTES
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar estructura de tabla participantes (externos)
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'participantes'
ORDER BY ordinal_position;

-- 2. Verificar estructura de tabla participantes_internos
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'participantes_internos'
ORDER BY ordinal_position;

-- 3. Verificar estructura de tabla participantes_friend_family
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'participantes_friend_family'
ORDER BY ordinal_position;

-- 4. Verificar si las tablas existen
SELECT 
    table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = table_name) 
        THEN 'EXISTE'
        ELSE 'NO EXISTE'
    END as estado
FROM (VALUES 
    ('participantes'),
    ('participantes_internos'),
    ('participantes_friend_family')
) AS t(table_name);

-- 5. Verificar datos de ejemplo en cada tabla
SELECT 'participantes' as tabla, COUNT(*) as total FROM participantes
UNION ALL
SELECT 'participantes_internos' as tabla, COUNT(*) as total FROM participantes_internos
UNION ALL
SELECT 'participantes_friend_family' as tabla, COUNT(*) as total FROM participantes_friend_family; 