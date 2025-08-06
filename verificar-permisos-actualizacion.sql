-- ====================================
-- VERIFICAR PERMISOS DE ACTUALIZACIÓN
-- ====================================

-- 1. VERIFICAR PERMISOS ESPECÍFICOS DE UPDATE
SELECT '=== PERMISOS UPDATE ESPECÍFICOS ===' as info;

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

-- 2. VERIFICAR ROLES ACTUALES
SELECT '=== ROLES ACTUALES ===' as info;

SELECT 
    rolname,
    rolsuper,
    rolinherit,
    rolcreaterole,
    rolcreatedb,
    rolcanlogin
FROM pg_roles 
WHERE rolname IN ('anon', 'authenticated', 'service_role', 'postgres');

-- 3. VERIFICAR POLÍTICAS RLS PARA UPDATE
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

-- 4. VERIFICAR SI RLS ESTÁ HABILITADO
SELECT '=== RLS HABILITADO ===' as info;

SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'investigaciones'
AND schemaname = 'public';

-- 5. PROBAR ACTUALIZACIÓN DIRECTA
SELECT '=== PRUEBA ACTUALIZACIÓN DIRECTA ===' as info;

-- Intentar actualizar solo el timestamp
UPDATE investigaciones 
SET actualizado_el = NOW()
WHERE id = 'ed58dbf4-f506-4b33-a0b7-1795458a67ff'
RETURNING id, nombre, actualizado_el;

-- 6. VERIFICAR ESTRUCTURA DE LA TABLA
SELECT '=== ESTRUCTURA TABLA ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'investigaciones' 
AND table_schema = 'public'
AND column_name IN ('id', 'nombre', 'estado', 'actualizado_el', 'producto_id', 'tipo_investigacion_id')
ORDER BY ordinal_position; 