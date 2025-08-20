-- =====================================================
-- DESCUBRIR ESTRUCTURA REAL DE TABLAS
-- =====================================================

-- 1. LISTAR TODAS LAS TABLAS QUE CONTIENEN "pais" EN EL NOMBRE
-- =====================================================
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name ILIKE '%pais%' 
   OR table_name ILIKE '%country%'
   OR table_name ILIKE '%nacionalidad%'
ORDER BY table_name;

-- 2. LISTAR TODAS LAS TABLAS QUE CONTIENEN "industria" EN EL NOMBRE
-- =====================================================
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name ILIKE '%industria%' 
   OR table_name ILIKE '%industry%'
   OR table_name ILIKE '%sector%'
ORDER BY table_name;

-- 3. LISTAR TODAS LAS TABLAS QUE CONTIENEN "tamaño" O "tamano" EN EL NOMBRE
-- =====================================================
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name ILIKE '%tamaño%' 
   OR table_name ILIKE '%tamano%'
   OR table_name ILIKE '%size%'
ORDER BY table_name;

-- 4. LISTAR TODAS LAS TABLAS QUE CONTIENEN "modalidad" EN EL NOMBRE
-- =====================================================
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name ILIKE '%modalidad%' 
   OR table_name ILIKE '%modality%'
ORDER BY table_name;

-- 5. LISTAR TODAS LAS TABLAS QUE CONTIENEN "relacion" EN EL NOMBRE
-- =====================================================
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name ILIKE '%relacion%' 
   OR table_name ILIKE '%relation%'
ORDER BY table_name;

-- 6. LISTAR TODAS LAS TABLAS QUE CONTIENEN "estado" EN EL NOMBRE
-- =====================================================
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name ILIKE '%estado%' 
   OR table_name ILIKE '%status%'
ORDER BY table_name;

-- 7. ESTRUCTURA COMPLETA DE LA TABLA EMPRESAS
-- =====================================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'empresas' 
ORDER BY ordinal_position;

-- 8. BUSCAR COLUMNAS QUE CONTIENEN "pais" EN EMPRESAS
-- =====================================================
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'empresas' 
  AND (column_name ILIKE '%pais%' OR column_name ILIKE '%country%')
ORDER BY ordinal_position;

-- 9. BUSCAR COLUMNAS QUE CONTIENEN "industria" EN EMPRESAS
-- =====================================================
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'empresas' 
  AND (column_name ILIKE '%industria%' OR column_name ILIKE '%industry%')
ORDER BY ordinal_position;

-- 10. BUSCAR COLUMNAS QUE CONTIENEN "tamaño" EN EMPRESAS
-- =====================================================
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'empresas' 
  AND (column_name ILIKE '%tamaño%' OR column_name ILIKE '%tamano%' OR column_name ILIKE '%size%')
ORDER BY ordinal_position;

-- 11. BUSCAR COLUMNAS QUE CONTIENEN "modalidad" EN EMPRESAS
-- =====================================================
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'empresas' 
  AND (column_name ILIKE '%modalidad%' OR column_name ILIKE '%modality%')
ORDER BY ordinal_position;

-- 12. BUSCAR COLUMNAS QUE CONTIENEN "relacion" EN EMPRESAS
-- =====================================================
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'empresas' 
  AND (column_name ILIKE '%relacion%' OR column_name ILIKE '%relation%')
ORDER BY ordinal_position;

-- 13. BUSCAR COLUMNAS QUE CONTIENEN "estado" EN EMPRESAS
-- =====================================================
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'empresas' 
  AND (column_name ILIKE '%estado%' OR column_name ILIKE '%status%')
ORDER BY ordinal_position;

-- 14. VER TODAS LAS TABLAS DE CATÁLOGOS (que terminan en _cat)
-- =====================================================
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name LIKE '%_cat'
ORDER BY table_name;

-- 15. VER TODAS LAS TABLAS QUE CONTIENEN "cat" EN EL NOMBRE
-- =====================================================
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name ILIKE '%cat%'
ORDER BY table_name;

-- 16. MUESTRA DE DATOS DE EMPRESAS (primeras 3 filas)
-- =====================================================
SELECT * FROM empresas LIMIT 3;

-- 17. VER TODAS LAS TABLAS DISPONIBLES
-- =====================================================
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
