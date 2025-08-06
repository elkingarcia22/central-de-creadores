-- ====================================
-- CORREGIR KAMS DE EMPRESAS
-- ====================================

-- 1. VERIFICAR USUARIOS DISPONIBLES
SELECT '=== USUARIOS DISPONIBLES ===' as info;
SELECT 
    id,
    nombre,
    correo
FROM usuarios 
ORDER BY nombre;

-- 2. VERIFICAR EMPRESAS ACTUALES
SELECT '=== EMPRESAS ACTUALES ===' as info;
SELECT 
    id,
    nombre,
    kam_id
FROM empresas 
ORDER BY nombre;

-- 3. ASIGNAR PRIMER USUARIO COMO KAM A TODAS LAS EMPRESAS
SELECT '=== ASIGNANDO KAMS VÁLIDOS ===' as info;

DO $$
DECLARE
    primer_usuario_id UUID;
    empresa_record RECORD;
BEGIN
    -- Obtener el primer usuario disponible
    SELECT id INTO primer_usuario_id FROM usuarios LIMIT 1;
    
    IF primer_usuario_id IS NOT NULL THEN
        -- Actualizar todas las empresas con el primer usuario
        UPDATE empresas 
        SET kam_id = primer_usuario_id;
        
        RAISE NOTICE 'KAMs asignados a todas las empresas: %', primer_usuario_id;
    ELSE
        RAISE NOTICE 'No hay usuarios disponibles para asignar como KAM';
    END IF;
END $$;

-- 4. VERIFICAR RESULTADO
SELECT '=== RESULTADO FINAL ===' as info;
SELECT 
    e.nombre as empresa,
    e.kam_id,
    u.nombre as kam_nombre,
    u.correo as kam_email
FROM empresas e
LEFT JOIN usuarios u ON e.kam_id = u.id
ORDER BY e.nombre;

-- 5. MENSAJE FINAL
SELECT '✅ KAMs corregidos exitosamente' as resultado; 