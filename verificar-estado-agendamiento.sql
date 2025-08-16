-- ====================================
-- VERIFICAR ESTADO DE AGENDAMIENTO
-- ====================================
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar todos los estados de agendamiento
SELECT '=== TODOS LOS ESTADOS DE AGENDAMIENTO ===' as info;

SELECT 
    id,
    nombre,
    color,
    activo
FROM estado_agendamiento_cat
ORDER BY nombre;

-- 2. Verificar el estado específico
SELECT '=== ESTADO ESPECÍFICO ===' as info;

SELECT 
    id,
    nombre,
    color,
    activo
FROM estado_agendamiento_cat
WHERE id = 'd32b84d1-6209-41d9-8108-03588ca1f9b5';

-- 3. Verificar reclutamiento específico
SELECT '=== RECLUTAMIENTO ESPECÍFICO ===' as info;

SELECT 
    r.id,
    r.estado_agendamiento,
    eac.nombre as estado_nombre,
    eac.color as estado_color
FROM reclutamientos r
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE r.id = '4934c0eb-4e41-45e9-b64a-25895acc167c';
