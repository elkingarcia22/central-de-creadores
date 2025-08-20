-- =====================================================
-- ACTUALIZAR EMPRESAS CON USUARIO VÁLIDO (CON NOMBRE)
-- =====================================================

-- 1. VER USUARIOS CON NOMBRE VÁLIDO
-- =====================================================
SELECT 'USUARIOS CON NOMBRE:' as info;
SELECT id, nombre FROM usuarios WHERE nombre IS NOT NULL ORDER BY nombre LIMIT 5;

-- 2. ACTUALIZAR EMPRESAS CON USUARIO QUE TENGA NOMBRE
-- =====================================================
-- Usar el primer usuario que tenga nombre
UPDATE empresas 
SET kam_id = (SELECT id FROM usuarios WHERE nombre IS NOT NULL LIMIT 1)
WHERE kam_id = 'bea59fc5-812f-4b71-8228-a50ffc85c2e8';

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
