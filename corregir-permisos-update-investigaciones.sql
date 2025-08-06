-- ====================================
-- CORREGIR PERMISOS UPDATE - TABLA INVESTIGACIONES
-- ====================================

-- 1. VERIFICAR PERMISOS ACTUALES
SELECT '=== PERMISOS ACTUALES ===' as info;

SELECT 
    grantee,
    privilege_type,
    is_grantable,
    table_name
FROM information_schema.role_table_grants 
WHERE table_name = 'investigaciones' 
AND table_schema = 'public'
ORDER BY grantee, privilege_type;

-- 2. CONCEDER PERMISOS UPDATE A ROLES NECESARIOS
SELECT '=== CONCEDIENDO PERMISOS UPDATE ===' as info;

-- Conceder permisos UPDATE al rol authenticated
GRANT UPDATE ON TABLE public.investigaciones TO authenticated;

-- Conceder permisos UPDATE al rol service_role
GRANT UPDATE ON TABLE public.investigaciones TO service_role;

-- Conceder permisos UPDATE al rol anon (si es necesario)
GRANT UPDATE ON TABLE public.investigaciones TO anon;

-- 3. VERIFICAR PERMISOS DESPUÉS DE LA CORRECCIÓN
SELECT '=== PERMISOS DESPUÉS DE LA CORRECCIÓN ===' as info;

SELECT 
    grantee,
    privilege_type,
    is_grantable,
    table_name
FROM information_schema.role_table_grants 
WHERE table_name = 'investigaciones' 
AND table_schema = 'public'
AND privilege_type = 'UPDATE'
ORDER BY grantee;

-- 4. VERIFICAR POLÍTICAS RLS PARA UPDATE
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

-- 5. PROBAR ACTUALIZACIÓN DESPUÉS DE CORREGIR PERMISOS
SELECT '=== PRUEBA ACTUALIZACIÓN ===' as info;

-- Probar actualización simple
UPDATE investigaciones 
SET actualizado_el = NOW()
WHERE id = 'ed58dbf4-f506-4b33-a0b7-1795458a67ff'
RETURNING id, nombre, actualizado_el;

-- 6. VERIFICAR ESTADO FINAL
SELECT '=== ESTADO FINAL ===' as info;

SELECT 
    id,
    nombre,
    estado,
    actualizado_el
FROM investigaciones 
WHERE id = 'ed58dbf4-f506-4b33-a0b7-1795458a67ff'; 