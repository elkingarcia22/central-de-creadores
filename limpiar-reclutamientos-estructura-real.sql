-- ====================================
-- LIMPIAR RECLUTAMIENTOS (ESTRUCTURA REAL)
-- ====================================
-- Ejecutar en Supabase SQL Editor
-- Basado en la estructura real documentada en ESTRUCTURA_REAL_RECLUTAMIENTOS.md

-- PASO 1: Verificar reclutamientos con participantes_id inválidos
SELECT '=== RECLUTAMIENTOS CON PARTICIPANTES_ID INVÁLIDOS ===' as info;

SELECT 
    r.id,
    r.participantes_id,
    r.investigacion_id,
    r.reclutador_id,
    CASE 
        WHEN p.id IS NULL THEN '❌ NO EXISTE EN PARTICIPANTES'
        ELSE '✅ EXISTE EN PARTICIPANTES'
    END as estado_participante
FROM reclutamientos r
LEFT JOIN participantes p ON r.participantes_id = p.id
WHERE r.participantes_id IS NOT NULL AND p.id IS NULL
ORDER BY r.id;

-- PASO 2: Verificar el ID problemático específico
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

-- PASO 3: Eliminar reclutamientos corruptos
SELECT '=== ELIMINANDO RECLUTAMIENTOS CORRUPTOS ===' as info;

DELETE FROM reclutamientos 
WHERE participantes_id IS NOT NULL 
AND participantes_id NOT IN (SELECT id FROM participantes);

SELECT '✅ Reclutamientos corruptos eliminados' as resultado;

-- PASO 4: Verificar estado final
SELECT '=== ESTADO FINAL ===' as info;

SELECT 
    'Total reclutamientos:' as info,
    COUNT(*) as total
FROM reclutamientos;

-- PASO 5: Mostrar reclutamientos válidos restantes
SELECT '=== RECLUTAMIENTOS VÁLIDOS RESTANTES ===' as info;

SELECT 
    r.id,
    r.investigacion_id,
    r.participantes_id,
    r.reclutador_id,
    r.fecha_sesion,
    r.estado_agendamiento
FROM reclutamientos r
ORDER BY r.id
LIMIT 10;

-- PASO 6: Mostrar participantes disponibles
SELECT '=== PARTICIPANTES DISPONIBLES ===' as info;

SELECT 
    'Participantes externos:' as tipo,
    COUNT(*) as total
FROM participantes
UNION ALL
SELECT 
    'Participantes internos:' as tipo,
    COUNT(*) as total
FROM participantes_internos; 