-- ====================================
-- VERIFICAR AUTO-SELECCIÓN DE KAM
-- ====================================

-- 1. VERIFICAR EMPRESAS Y SUS KAMS
SELECT '=== EMPRESAS Y KAMS ===' as info;
SELECT 
    e.id as empresa_id,
    e.nombre as empresa_nombre,
    e.kam_id,
    u.id as usuario_id,
    u.nombre as usuario_nombre,
    u.correo as usuario_email
FROM empresas e
LEFT JOIN usuarios u ON e.kam_id = u.id
ORDER BY e.nombre;

-- 2. VERIFICAR SI HAY EMPRESAS SIN KAM
SELECT '=== EMPRESAS SIN KAM ===' as info;
SELECT 
    id,
    nombre,
    kam_id
FROM empresas 
WHERE kam_id IS NULL;

-- 3. VERIFICAR SI HAY KAMS INVÁLIDOS
SELECT '=== KAMS INVÁLIDOS ===' as info;
SELECT 
    e.id as empresa_id,
    e.nombre as empresa_nombre,
    e.kam_id
FROM empresas e
LEFT JOIN usuarios u ON e.kam_id = u.id
WHERE e.kam_id IS NOT NULL 
  AND u.id IS NULL;

-- 4. ASIGNAR KAMS A EMPRESAS QUE NO LOS TENGAN
SELECT '=== ASIGNANDO KAMS FALTANTES ===' as info;

DO $$
DECLARE
    primer_usuario_id UUID;
    empresa_record RECORD;
BEGIN
    -- Obtener el primer usuario disponible
    SELECT id INTO primer_usuario_id FROM usuarios LIMIT 1;
    
    IF primer_usuario_id IS NOT NULL THEN
        -- Actualizar empresas sin KAM
        UPDATE empresas 
        SET kam_id = primer_usuario_id
        WHERE kam_id IS NULL;
        
        RAISE NOTICE 'KAMs asignados a empresas que no tenían';
    ELSE
        RAISE NOTICE 'No hay usuarios disponibles para asignar como KAM';
    END IF;
END $$;

-- 5. VERIFICAR RESULTADO FINAL
SELECT '=== RESULTADO FINAL ===' as info;
SELECT 
    e.nombre as empresa,
    e.kam_id,
    u.nombre as kam_nombre,
    u.correo as kam_email
FROM empresas e
LEFT JOIN usuarios u ON e.kam_id = u.id
ORDER BY e.nombre;

-- 6. MENSAJE FINAL
SELECT '✅ Verificación de auto-selección completada' as resultado; 