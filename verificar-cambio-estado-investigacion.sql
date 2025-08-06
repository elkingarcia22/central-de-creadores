-- ====================================
-- VERIFICAR CAMBIO DE ESTADO DE INVESTIGACIÓN
-- ====================================

-- 1. VERIFICAR ESTADO ACTUAL DE LA INVESTIGACIÓN
SELECT '=== ESTADO ACTUAL ===' as info;

SELECT 
    id,
    nombre,
    estado,
    actualizado_el
FROM investigaciones 
WHERE id = 'ed58dbf4-f506-4b33-a0b7-1795458a67ff';

-- 2. VERIFICAR ENUMS DISPONIBLES
SELECT '=== ENUMS DISPONIBLES ===' as info;

SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'enum_estado_investigacion'
ORDER BY e.enumsortorder;

-- 3. PROBAR CAMBIO DE ESTADO MANUAL
SELECT '=== PRUEBA CAMBIO DE ESTADO ===' as info;

-- Cambiar de 'en_borrador' a 'por_agendar'
UPDATE investigaciones 
SET 
    estado = 'por_agendar',
    actualizado_el = NOW()
WHERE id = 'ed58dbf4-f506-4b33-a0b7-1795458a67ff'
    AND estado = 'en_borrador'
RETURNING id, nombre, estado, actualizado_el;

-- 4. VERIFICAR ESTADO DESPUÉS DEL CAMBIO
SELECT '=== ESTADO DESPUÉS DEL CAMBIO ===' as info;

SELECT 
    id,
    nombre,
    estado,
    actualizado_el
FROM investigaciones 
WHERE id = 'ed58dbf4-f506-4b33-a0b7-1795458a67ff';

-- 5. VERIFICAR PERMISOS DE ACTUALIZACIÓN
SELECT '=== PERMISOS DE ACTUALIZACIÓN ===' as info;

SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'investigaciones' 
AND table_schema = 'public'
AND privilege_type = 'UPDATE'
ORDER BY grantee;

-- 6. VERIFICAR POLÍTICAS RLS PARA UPDATE
SELECT '=== POLÍTICAS RLS UPDATE ===' as info;

SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'investigaciones'
AND schemaname = 'public'
AND cmd = 'UPDATE'; 