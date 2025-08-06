-- ====================================
-- VERIFICAR ESTRUCTURA Y PERMISOS - ERROR 400
-- ====================================

-- 1. VERIFICAR ESTRUCTURA DE LA TABLA
SELECT '=== ESTRUCTURA DE LA TABLA INVESTIGACIONES ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'investigaciones' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. VERIFICAR ENUMS
SELECT '=== ENUMS DE ESTADO ===' as info;

SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'enum_estado_investigacion'
ORDER BY e.enumsortorder;

-- 3. VERIFICAR PERMISOS DE ROLES
SELECT '=== PERMISOS DE ROLES ===' as info;

SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'investigaciones' 
AND table_schema = 'public'
ORDER BY grantee, privilege_type;

-- 4. VERIFICAR POLÍTICAS RLS
SELECT '=== POLÍTICAS RLS ===' as info;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'investigaciones'
AND schemaname = 'public';

-- 5. VERIFICAR DATOS DE LA INVESTIGACIÓN ESPECÍFICA
SELECT '=== DATOS DE LA INVESTIGACIÓN ===' as info;

SELECT 
    id,
    nombre,
    estado,
    actualizado_el,
    creado_el
FROM investigaciones 
WHERE id IN (
    'ed58dbf4-f506-4b33-a0b7-1795458a67ff',
    '96c3eebd-a1d9-4489-ba26-f678bee87854'
);

-- 6. VERIFICAR SI HAY TRIGGERS
SELECT '=== TRIGGERS ===' as info;

SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'investigaciones'
AND event_object_schema = 'public';

-- 7. VERIFICAR CONSTRAINTS
SELECT '=== CONSTRAINTS ===' as info;

SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'investigaciones'
AND table_schema = 'public';

-- 8. VERIFICAR ÍNDICES
SELECT '=== ÍNDICES ===' as info;

SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'investigaciones'
AND schemaname = 'public'; 