-- =====================================================
-- VERIFICAR SI EXISTEN LOS IDs ACTUALIZADOS
-- =====================================================

-- 1. VERIFICAR SI EXISTE EL USUARIO KAM
-- =====================================================
SELECT 
    'USUARIO KAM' as tabla,
    'bea59fc5-812f-4b71-8228-a50ffc85c2e8' as id_buscado,
    CASE WHEN u.id IS NOT NULL THEN 'EXISTE' ELSE 'NO EXISTE' END as existe,
    u.nombre as nombre_encontrado
FROM usuarios u
WHERE u.id = 'bea59fc5-812f-4b71-8228-a50ffc85c2e8';

-- 2. VERIFICAR SI EXISTE EL PRODUCTO
-- =====================================================
SELECT 
    'PRODUCTO' as tabla,
    '08e6b770-b69e-4e4e-aeef-aec8c5c247b5' as id_buscado,
    CASE WHEN p.id IS NOT NULL THEN 'EXISTE' ELSE 'NO EXISTE' END as existe,
    p.nombre as nombre_encontrado,
    p.activo as activo_encontrado
FROM productos p
WHERE p.id = '08e6b770-b69e-4e4e-aeef-aec8c5c247b5';

-- 3. VER CUÁNTOS USUARIOS HAY
-- =====================================================
SELECT 
    'TOTAL USUARIOS' as seccion,
    COUNT(*) as total_usuarios
FROM usuarios;

-- 4. VER MUESTRA DE USUARIOS
-- =====================================================
SELECT 
    'MUESTRA USUARIOS' as seccion,
    id,
    nombre
FROM usuarios 
LIMIT 5;

-- 5. VER CUÁNTOS PRODUCTOS HAY
-- =====================================================
SELECT 
    'TOTAL PRODUCTOS' as seccion,
    COUNT(*) as total_productos
FROM productos;

-- 6. VER MUESTRA DE PRODUCTOS
-- =====================================================
SELECT 
    'MUESTRA PRODUCTOS' as seccion,
    id,
    nombre,
    activo
FROM productos 
LIMIT 5;
