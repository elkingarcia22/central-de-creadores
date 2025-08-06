-- ====================================
-- VERIFICAR ESTRUCTURA TABLA INVESTIGACIONES
-- ====================================

-- 1. VERIFICAR SI LA TABLA EXISTE
SELECT '=== VERIFICAR TABLA INVESTIGACIONES ===' as info;

SELECT COUNT(*) as tabla_existe
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name = 'investigaciones';

-- 2. ESTRUCTURA COMPLETA DE LA TABLA
SELECT '=== ESTRUCTURA DE LA TABLA ===' as info;

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

-- 3. VERIFICAR ENUMS
SELECT '=== VERIFICAR ENUMS ===' as info;

SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
AND t.typname LIKE '%investigacion%'
ORDER BY t.typname, e.enumsortorder;

-- 4. VERIFICAR FOREIGN KEYS
SELECT '=== VERIFICAR FOREIGN KEYS ===' as info;

SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'investigaciones';

-- 5. VERIFICAR RLS (VERSIÓN COMPATIBLE)
SELECT '=== VERIFICAR RLS ===' as info;

SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'investigaciones';

-- 6. VERIFICAR POLÍTICAS RLS
SELECT '=== VERIFICAR POLÍTICAS RLS ===' as info;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'investigaciones';

-- 7. CONTEO DE REGISTROS
SELECT '=== CONTEO DE REGISTROS ===' as info;

SELECT COUNT(*) as total_investigaciones 
FROM investigaciones;

-- 8. VERIFICAR INVESTIGACIÓN ESPECÍFICA
SELECT '=== VERIFICAR INVESTIGACIÓN ESPECÍFICA ===' as info;

SELECT 
    id,
    nombre,
    estado,
    fecha_inicio,
    fecha_fin,
    producto_id,
    tipo_investigacion_id,
    creado_el,
    actualizado_el
FROM investigaciones 
WHERE id = 'ed58dbf4-f506-4b33-a0b7-1795458a67ff';

-- 9. VERIFICAR ESTADOS ÚNICOS
SELECT '=== VERIFICAR ESTADOS ÚNICOS ===' as info;

SELECT 
    estado,
    COUNT(*) as cantidad
FROM investigaciones 
GROUP BY estado
ORDER BY cantidad DESC;

-- 10. VERIFICAR PRODUCTOS REFERENCIADOS
SELECT '=== VERIFICAR PRODUCTOS REFERENCIADOS ===' as info;

SELECT DISTINCT
    i.producto_id,
    p.nombre as producto_nombre,
    COUNT(*) as cantidad_investigaciones
FROM investigaciones i
LEFT JOIN productos p ON i.producto_id = p.id
GROUP BY i.producto_id, p.nombre
ORDER BY cantidad_investigaciones DESC;

-- 11. VERIFICAR TIPOS DE INVESTIGACIÓN REFERENCIADOS
SELECT '=== VERIFICAR TIPOS DE INVESTIGACIÓN ===' as info;

SELECT DISTINCT
    i.tipo_investigacion_id,
    t.nombre as tipo_nombre,
    COUNT(*) as cantidad_investigaciones
FROM investigaciones i
LEFT JOIN tipos_investigacion t ON i.tipo_investigacion_id = t.id
GROUP BY i.tipo_investigacion_id, t.nombre
ORDER BY cantidad_investigaciones DESC; 

-- Verificar estructura real de la tabla investigaciones

-- 1. ESTRUCTURA DE INVESTIGACIONES
SELECT 
  'INVESTIGACIONES' as tabla,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'investigaciones'
ORDER BY ordinal_position;

-- 2. VERIFICAR SI EXISTE LA TABLA EMPRESAS
SELECT 
  'TABLA EMPRESAS' as tabla,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'empresas'
ORDER BY ordinal_position;

-- 3. VERIFICAR DATOS EN INVESTIGACIONES
SELECT 
  'DATOS EN INVESTIGACIONES' as fuente,
  COUNT(*) as total_investigaciones
FROM investigaciones;

-- 4. VERIFICAR PRIMERAS 5 INVESTIGACIONES
SELECT 
  'PRIMERAS 5 INVESTIGACIONES' as fuente,
  id,
  nombre
FROM investigaciones 
LIMIT 5; 