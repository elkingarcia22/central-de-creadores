-- =====================================================
-- ACTUALIZAR EMPRESAS CON IDs VÁLIDOS DE USUARIOS PARA KAM
-- =====================================================

-- 1. VER USUARIOS DISPONIBLES
-- =====================================================
SELECT 'USUARIOS DISPONIBLES:' as info;
SELECT id, nombre FROM usuarios ORDER BY nombre LIMIT 10;

-- 2. ACTUALIZAR EMPRESAS CON USUARIO VÁLIDO PARA KAM
-- =====================================================
-- Usar el primer usuario disponible
UPDATE empresas 
SET kam_id = (SELECT id FROM usuarios LIMIT 1)
WHERE kam_id = '0332e905-06e1-4e5d-bf81-7e4b9e8a41d6';

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
