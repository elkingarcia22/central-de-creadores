-- ====================================
-- LIMPIAR DATOS CORRUPTOS (CORREGIDO)
-- ====================================
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Verificar reclutamientos con participantes_id inválidos
SELECT '=== RECLUTAMIENTOS CON PARTICIPANTES_ID INVÁLIDOS ===' as info;

SELECT 
    r.id,
    r.participantes_id,
    r.investigacion_id,
    r.created_at,
    CASE 
        WHEN p.id IS NULL THEN '❌ NO EXISTE EN PARTICIPANTES'
        ELSE '✅ EXISTE EN PARTICIPANTES'
    END as estado_participante
FROM reclutamientos r
LEFT JOIN participantes p ON r.participantes_id = p.id
WHERE p.id IS NULL
ORDER BY r.created_at DESC;

-- PASO 2: Eliminar reclutamientos con participantes_id inválidos
SELECT '=== ELIMINANDO RECLUTAMIENTOS CORRUPTOS ===' as info;

DELETE FROM reclutamientos 
WHERE participantes_id NOT IN (
    SELECT id FROM participantes
);

SELECT '✅ Reclutamientos corruptos eliminados' as resultado;

-- PASO 3: Verificar estado final
SELECT '=== ESTADO FINAL ===' as info;

SELECT 
    'Total reclutamientos:' as info,
    COUNT(*) as total
FROM reclutamientos;

SELECT 
    'Reclutamientos válidos:' as info,
    COUNT(*) as total
FROM reclutamientos r
INNER JOIN participantes p ON r.participantes_id = p.id; 