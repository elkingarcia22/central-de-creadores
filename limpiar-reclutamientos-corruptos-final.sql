-- ====================================
-- LIMPIAR RECLUTAMIENTOS CORRUPTOS (FINAL)
-- ====================================
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Verificar reclutamientos con participantes_id inválidos
SELECT '=== RECLUTAMIENTOS CON PARTICIPANTES_ID INVÁLIDOS ===' as info;

SELECT 
    r.id,
    r.participantes_id,
    r.investigacion_id,
    CASE 
        WHEN p.id IS NULL THEN '❌ NO EXISTE EN PARTICIPANTES'
        ELSE '✅ EXISTE EN PARTICIPANTES'
    END as estado_participante
FROM reclutamientos r
LEFT JOIN participantes p ON r.participantes_id = p.id
WHERE p.id IS NULL
ORDER BY r.id;

-- PASO 2: Verificar reclutamientos con participantes_internos_id inválidos
SELECT '=== RECLUTAMIENTOS CON PARTICIPANTES_INTERNOS_ID INVÁLIDOS ===' as info;

SELECT 
    r.id,
    r.participantes_internos_id,
    r.investigacion_id,
    CASE 
        WHEN pi.id IS NULL THEN '❌ NO EXISTE EN PARTICIPANTES_INTERNOS'
        ELSE '✅ EXISTE EN PARTICIPANTES_INTERNOS'
    END as estado_participante
FROM reclutamientos r
LEFT JOIN participantes_internos pi ON r.participantes_internos_id = pi.id
WHERE r.participantes_internos_id IS NOT NULL AND pi.id IS NULL
ORDER BY r.id;

-- PASO 3: Eliminar reclutamientos corruptos
SELECT '=== ELIMINANDO RECLUTAMIENTOS CORRUPTOS ===' as info;

-- Eliminar reclutamientos con participantes_id inválidos
DELETE FROM reclutamientos 
WHERE participantes_id IS NOT NULL 
AND participantes_id NOT IN (SELECT id FROM participantes);

-- Eliminar reclutamientos con participantes_internos_id inválidos
DELETE FROM reclutamientos 
WHERE participantes_internos_id IS NOT NULL 
AND participantes_internos_id NOT IN (SELECT id FROM participantes_internos);

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
    r.participantes_internos_id,
    r.estado_agendamiento
FROM reclutamientos r
ORDER BY r.id
LIMIT 10; 