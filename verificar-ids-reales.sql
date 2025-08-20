-- =====================================================
-- VERIFICAR IDs REALES EN LAS TABLAS
-- =====================================================

-- 1. VER TODOS LOS USUARIOS CON SUS IDs
-- =====================================================
SELECT 'TODOS LOS USUARIOS:' as info;
SELECT id, nombre FROM usuarios ORDER BY nombre;

-- 2. VER TODOS LOS PRODUCTOS CON SUS IDs
-- =====================================================
SELECT 'TODOS LOS PRODUCTOS:' as info;
SELECT id, nombre, activo FROM productos ORDER BY nombre;

-- 3. VER EMPRESAS CON SUS IDs DE KAM Y PRODUCTO
-- =====================================================
SELECT 'EMPRESAS CON SUS IDs:' as info;
SELECT id, nombre, kam_id, producto_id FROM empresas ORDER BY nombre;
