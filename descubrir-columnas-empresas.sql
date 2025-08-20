-- =====================================================
-- DESCUBRIR COLUMNAS REALES DE LA TABLA EMPRESAS
-- =====================================================

-- 1. VER TODAS LAS COLUMNAS DE LA TABLA EMPRESAS
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

-- 2. VER UNA MUESTRA DE DATOS DE EMPRESAS (primeras 3 filas)
-- =====================================================
SELECT * FROM empresas LIMIT 3;

-- 3. VER CUÁNTAS EMPRESAS HAY EN TOTAL
-- =====================================================
SELECT COUNT(*) as total_empresas FROM empresas;

-- 4. VER UNA EMPRESA ESPECÍFICA (todos sus campos)
-- =====================================================
SELECT * FROM empresas WHERE id = '56ae11ec-f6b4-4066-9414-e51adfbebee2';

-- 5. BUSCAR COLUMNAS QUE CONTIENEN "email" EN EL NOMBRE
-- =====================================================
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'empresas' 
  AND column_name ILIKE '%email%'
ORDER BY ordinal_position;

-- 6. BUSCAR COLUMNAS QUE CONTIENEN "telefono" EN EL NOMBRE
-- =====================================================
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'empresas' 
  AND column_name ILIKE '%telefono%'
ORDER BY ordinal_position;

-- 7. BUSCAR COLUMNAS QUE CONTIENEN "direccion" EN EL NOMBRE
-- =====================================================
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'empresas' 
  AND column_name ILIKE '%direccion%'
ORDER BY ordinal_position;

-- 8. BUSCAR COLUMNAS QUE CONTIENEN "contacto" EN EL NOMBRE
-- =====================================================
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'empresas' 
  AND column_name ILIKE '%contacto%'
ORDER BY ordinal_position;

-- 9. VER TODAS LAS COLUMNAS QUE TERMINAN EN "_id"
-- =====================================================
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'empresas' 
  AND column_name LIKE '%_id'
ORDER BY ordinal_position;

-- 10. VER TODAS LAS COLUMNAS QUE NO TERMINAN EN "_id"
-- =====================================================
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'empresas' 
  AND column_name NOT LIKE '%_id'
ORDER BY ordinal_position;
