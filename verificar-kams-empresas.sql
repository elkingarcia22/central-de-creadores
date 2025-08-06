-- ====================================
-- VERIFICAR KAMS ASIGNADOS A EMPRESAS
-- ====================================

-- 1. VERIFICAR EMPRESAS CON KAMS
SELECT '=== EMPRESAS CON KAMS ===' as info;
SELECT 
    e.nombre as empresa,
    e.kam_id,
    u.nombre as kam_nombre,
    u.apellido as kam_apellido,
    u.correo as kam_email
FROM empresas e
LEFT JOIN usuarios u ON e.kam_id = u.id
ORDER BY e.nombre;

-- 2. VERIFICAR EMPRESAS SIN KAM
SELECT '=== EMPRESAS SIN KAM ===' as info;
SELECT 
    e.nombre as empresa,
    e.kam_id
FROM empresas e
WHERE e.kam_id IS NULL OR e.kam_id = '';

-- 3. VERIFICAR USUARIOS DISPONIBLES PARA KAM
SELECT '=== USUARIOS DISPONIBLES ===' as info;
SELECT 
    id,
    nombre,
    apellido,
    correo
FROM usuarios
ORDER BY nombre;

-- 4. ASIGNAR KAMS SI FALTAN
SELECT '=== ASIGNANDO KAMS FALTANTES ===' as info;

-- Obtener el primer usuario disponible
DO $$
DECLARE
    primer_usuario_id UUID;
    empresa_record RECORD;
BEGIN
    -- Obtener el primer usuario
    SELECT id INTO primer_usuario_id FROM usuarios LIMIT 1;
    
    IF primer_usuario_id IS NOT NULL THEN
        -- Actualizar empresas sin KAM
        UPDATE empresas 
        SET kam_id = primer_usuario_id
        WHERE kam_id IS NULL OR kam_id = '';
        
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
    u.apellido as kam_apellido,
    u.correo as kam_email
FROM empresas e
LEFT JOIN usuarios u ON e.kam_id = u.id
ORDER BY e.nombre;

-- 6. MENSAJE FINAL
SELECT '✅ Verificación de KAMs completada' as resultado; 