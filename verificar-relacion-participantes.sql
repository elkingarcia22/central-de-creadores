-- ====================================
-- VERIFICAR RELACIÓN PARTICIPANTES
-- ====================================
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Verificar foreign keys existentes
SELECT '=== FOREIGN KEYS EXISTENTES ===' as info;

SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='participantes_internos';

-- PASO 2: Verificar datos en participantes_internos
SELECT '=== DATOS EN PARTICIPANTES_INTERNOS ===' as info;

SELECT COUNT(*) as total_participantes
FROM participantes_internos;

SELECT id, nombre, email, departamento_id, activo
FROM participantes_internos 
WHERE activo = true
ORDER BY nombre;

-- PASO 3: Probar consulta manual
SELECT '=== PRUEBA CONSULTA MANUAL ===' as info;

SELECT 
    pi.id,
    pi.nombre,
    pi.email,
    pi.departamento_id,
    d.nombre as departamento_nombre,
    d.categoria as departamento_categoria
FROM participantes_internos pi
LEFT JOIN departamentos d ON pi.departamento_id = d.id
WHERE pi.activo = true
ORDER BY pi.nombre;

-- PASO 4: Verificar si RLS está habilitado en participantes_internos
SELECT '=== RLS PARTICIPANTES_INTERNOS ===' as info;

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename = 'participantes_internos';

-- PASO 5: Deshabilitar RLS si está habilitado
SELECT '=== DESHABILITANDO RLS PARTICIPANTES ===' as info;

ALTER TABLE participantes_internos DISABLE ROW LEVEL SECURITY;

SELECT '✅ RLS deshabilitado en participantes_internos' as resultado;

-- PASO 6: Verificar datos finales
SELECT '=== VERIFICACIÓN FINAL ===' as info;

SELECT COUNT(*) as participantes_activos
FROM participantes_internos 
WHERE activo = true; 