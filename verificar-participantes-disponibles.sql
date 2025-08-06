-- ====================================
-- VERIFICAR PARTICIPANTES DISPONIBLES
-- ====================================
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Verificar participantes activos
SELECT '=== PARTICIPANTES ACTIVOS ===' as info;

SELECT 
    id,
    nombre,
    email,
    activo,
    created_at
FROM participantes 
WHERE activo = true
ORDER BY nombre
LIMIT 10;

-- PASO 2: Verificar participantes internos activos
SELECT '=== PARTICIPANTES INTERNOS ACTIVOS ===' as info;

SELECT 
    id,
    nombre,
    email,
    departamento_id,
    activo,
    created_at
FROM participantes_internos 
WHERE activo = true
ORDER BY nombre
LIMIT 10;

-- PASO 3: Verificar reclutamientos existentes
SELECT '=== RECLUTAMIENTOS EXISTENTES ===' as info;

SELECT 
    id,
    participantes_id,
    investigacion_id,
    estado_agendamiento,
    created_at
FROM reclutamientos 
ORDER BY created_at DESC
LIMIT 10;

-- PASO 4: Verificar si el ID problemático existe
SELECT '=== VERIFICAR ID PROBLEMÁTICO ===' as info;

SELECT 'ID problemático: af4eb891-2a6e-44e0-84d3-b00592775c08' as info;

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

-- PASO 5: Mostrar IDs válidos para usar
SELECT '=== IDs VÁLIDOS PARA USAR ===' as info;

SELECT 
    'participantes' as tabla,
    id,
    nombre,
    email
FROM participantes 
WHERE activo = true
ORDER BY nombre
LIMIT 5; 