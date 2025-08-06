-- ====================================
-- VERIFICAR ESTRUCTURA RECLUTAMIENTO REAL
-- ====================================
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Estructura de participantes (externos)
SELECT '=== ESTRUCTURA PARTICIPANTES (EXTERNOS) ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'participantes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- PASO 2: Estructura de participantes_internos
SELECT '=== ESTRUCTURA PARTICIPANTES_INTERNOS ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'participantes_internos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- PASO 3: Estructura de reclutamientos
SELECT '=== ESTRUCTURA RECLUTAMIENTOS ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'reclutamientos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- PASO 4: Verificar datos existentes
SELECT '=== DATOS EXISTENTES ===' as info;

SELECT 
    'Participantes externos:' as tabla, COUNT(*) as total FROM participantes
UNION ALL
SELECT 'Participantes internos:' as tabla, COUNT(*) as total FROM participantes_internos
UNION ALL
SELECT 'Reclutamientos:' as tabla, COUNT(*) as total FROM reclutamientos;

-- PASO 5: Verificar el ID problemático
SELECT '=== VERIFICAR ID PROBLEMÁTICO ===' as info;

SELECT 'ID: af4eb891-2a6e-44e0-84d3-b00592775c08' as info;

SELECT 
    'En participantes:' as tabla,
    COUNT(*) as existe
FROM participantes 
WHERE id = 'af4eb891-2a6e-44e0-84d3-b00592775c08'
UNION ALL
SELECT 
    'En participantes_internos:' as tabla,
    COUNT(*) as existe
FROM participantes_internos 
WHERE id = 'af4eb891-2a6e-44e0-84d3-b00592775c08';

-- PASO 6: Mostrar algunos participantes válidos
SELECT '=== PARTICIPANTES VÁLIDOS ===' as info;

SELECT 
    'Externos:' as tipo,
    id,
    nombre,
    email
FROM participantes 
LIMIT 3
UNION ALL
SELECT 
    'Internos:' as tipo,
    id,
    nombre,
    email
FROM participantes_internos 
LIMIT 3; 