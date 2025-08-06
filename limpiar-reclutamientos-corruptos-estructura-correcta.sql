-- ====================================
-- LIMPIAR RECLUTAMIENTOS CORRUPTOS (ESTRUCTURA CORRECTA)
-- ====================================
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Verificar reclutamientos con participante_externo_id inválidos
SELECT '=== RECLUTAMIENTOS CON PARTICIPANTE_EXTERNO_ID INVÁLIDOS ===' as info;

SELECT 
    r.id,
    r.participante_externo_id,
    r.investigacion_id,
    CASE 
        WHEN p.id IS NULL THEN '❌ NO EXISTE EN PARTICIPANTES'
        ELSE '✅ EXISTE EN PARTICIPANTES'
    END as estado_participante
FROM reclutamientos r
LEFT JOIN participantes p ON r.participante_externo_id = p.id
WHERE r.participante_externo_id IS NOT NULL AND p.id IS NULL
ORDER BY r.id;

-- PASO 2: Verificar reclutamientos con participante_interno_id inválidos
SELECT '=== RECLUTAMIENTOS CON PARTICIPANTE_INTERNO_ID INVÁLIDOS ===' as info;

SELECT 
    r.id,
    r.participante_interno_id,
    r.investigacion_id,
    CASE 
        WHEN pi.id IS NULL THEN '❌ NO EXISTE EN PARTICIPANTES_INTERNOS'
        ELSE '✅ EXISTE EN PARTICIPANTES_INTERNOS'
    END as estado_participante
FROM reclutamientos r
LEFT JOIN participantes_internos pi ON r.participante_interno_id = pi.id
WHERE r.participante_interno_id IS NOT NULL AND pi.id IS NULL
ORDER BY r.id;

-- PASO 3: Eliminar reclutamientos corruptos
SELECT '=== ELIMINANDO RECLUTAMIENTOS CORRUPTOS ===' as info;

-- Eliminar reclutamientos con participante_externo_id inválidos
DELETE FROM reclutamientos 
WHERE participante_externo_id IS NOT NULL 
AND participante_externo_id NOT IN (SELECT id FROM participantes);

-- Eliminar reclutamientos con participante_interno_id inválidos
DELETE FROM reclutamientos 
WHERE participante_interno_id IS NOT NULL 
AND participante_interno_id NOT IN (SELECT id FROM participantes_internos);

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
    r.participante_externo_id,
    r.participante_interno_id,
    r.tipo_participante,
    r.estado_agendamiento
FROM reclutamientos r
ORDER BY r.id
LIMIT 10; 