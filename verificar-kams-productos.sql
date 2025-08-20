-- =====================================================
-- VERIFICAR SI EXISTEN LOS IDs DE KAM Y PRODUCTOS
-- =====================================================

-- 1. VERIFICAR SI EXISTE EL KAM
-- =====================================================
SELECT 
    'KAM' as tabla,
    '0332e905-06e1-4e5d-bf81-7e4b9e8a41d6' as id_buscado,
    CASE WHEN k.id IS NOT NULL THEN 'EXISTE' ELSE 'NO EXISTE' END as existe,
    k.nombre as nombre_encontrado
FROM kams k
WHERE k.id = '0332e905-06e1-4e5d-bf81-7e4b9e8a41d6';

-- 2. VERIFICAR SI EXISTE EL PRODUCTO 1
-- =====================================================
SELECT 
    'PRODUCTO 1' as tabla,
    '08e6b770-b69e-4e4e-aeef-aec8c5c247b5' as id_buscado,
    CASE WHEN p.id IS NOT NULL THEN 'EXISTE' ELSE 'NO EXISTE' END as existe,
    p.nombre as nombre_encontrado,
    p.activo as activo_encontrado
FROM productos p
WHERE p.id = '08e6b770-b69e-4e4e-aeef-aec8c5c247b5';

-- 3. VERIFICAR SI EXISTE EL PRODUCTO 2
-- =====================================================
SELECT 
    'PRODUCTO 2' as tabla,
    '709cad36-6807-4c64-ab58-22e6156e616d' as id_buscado,
    CASE WHEN p.id IS NOT NULL THEN 'EXISTE' ELSE 'NO EXISTE' END as existe,
    p.nombre as nombre_encontrado,
    p.activo as activo_encontrado
FROM productos p
WHERE p.id = '709cad36-6807-4c64-ab58-22e6156e616d';

-- 4. VER TODOS LOS KAMS DISPONIBLES
-- =====================================================
SELECT 
    'TODOS LOS KAMS' as seccion,
    COUNT(*) as total_kams
FROM kams;

-- 5. VER MUESTRA DE KAMS
-- =====================================================
SELECT 
    'MUESTRA KAMS' as seccion,
    id,
    nombre
FROM kams 
LIMIT 5;

-- 6. VER TODOS LOS PRODUCTOS DISPONIBLES
-- =====================================================
SELECT 
    'TODOS LOS PRODUCTOS' as seccion,
    COUNT(*) as total_productos
FROM productos;

-- 7. VER MUESTRA DE PRODUCTOS
-- =====================================================
SELECT 
    'MUESTRA PRODUCTOS' as seccion,
    id,
    nombre,
    activo
FROM productos 
LIMIT 5;

-- 8. VER ESTRUCTURA DE LA TABLA KAMS
-- =====================================================
SELECT 
    'ESTRUCTURA KAMS' as seccion,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'kams' 
ORDER BY ordinal_position;

-- 9. VER ESTRUCTURA DE LA TABLA PRODUCTOS
-- =====================================================
SELECT 
    'ESTRUCTURA PRODUCTOS' as seccion,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'productos' 
ORDER BY ordinal_position;
