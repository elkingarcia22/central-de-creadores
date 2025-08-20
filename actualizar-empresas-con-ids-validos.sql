-- =====================================================
-- ACTUALIZAR EMPRESAS CON IDs VÁLIDOS DE KAM Y PRODUCTOS
-- =====================================================

-- 1. PRIMERO VER QUÉ KAMS Y PRODUCTOS TENEMOS DISPONIBLES
-- =====================================================
SELECT 'KAMS DISPONIBLES:' as info;
SELECT id, nombre FROM kams ORDER BY nombre;

SELECT 'PRODUCTOS DISPONIBLES:' as info;
SELECT id, nombre FROM productos ORDER BY nombre;

-- 2. ACTUALIZAR EMPRESAS CON KAM Y PRODUCTO VÁLIDOS
-- =====================================================
-- Usar el primer KAM disponible
UPDATE empresas 
SET kam_id = (SELECT id FROM kams LIMIT 1)
WHERE kam_id = '0332e905-06e1-4e5d-bf81-7e4b9e8a41d6';

-- Usar el primer producto disponible
UPDATE empresas 
SET producto_id = (SELECT id FROM productos LIMIT 1)
WHERE producto_id = '08e6b770-b69e-4e4e-aeef-aec8c5c247b5';

-- 3. VERIFICAR QUE SE ACTUALIZARON
-- =====================================================
SELECT 
    'EMPRESAS ACTUALIZADAS:' as info,
    id,
    nombre,
    kam_id,
    producto_id
FROM empresas 
WHERE id IN (
    '56ae11ec-f6b4-4066-9414-e51adfbebee2',
    '5e72826f-b084-4d6a-8f05-156c5072b2f0',
    '831f1a9c-0114-44b6-abd8-40bf81b781e1',
    'e3fe8e55-b69f-4fa8-9fbd-559af8457931',
    'f82aa513-b5f9-48a3-b071-e3a8fe2023a4'
);
