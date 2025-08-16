-- ====================================
-- ASIGNAR TEFA EN RECLUTAMIENTOS (SIMPLE)
-- ====================================
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar reclutamientos disponibles
SELECT '=== RECLUTAMIENTOS DISPONIBLES ===' as info;
SELECT 
    r.id as reclutamiento_id,
    r.investigacion_id,
    r.reclutador_id,
    r.estado_agendamiento,
    i.nombre as investigacion_nombre
FROM reclutamientos r
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
WHERE r.reclutador_id IS NULL
ORDER BY r.id DESC
LIMIT 5;

-- 2. Asignar a tefa como reclutador en 3 reclutamientos
SELECT '=== ASIGNANDO A TEFA ===' as info;

UPDATE reclutamientos 
SET reclutador_id = '5ff1169b-f725-4a8c-bc5d-0bead2c87afc'
WHERE id IN (
    SELECT r.id 
    FROM reclutamientos r
    WHERE r.reclutador_id IS NULL
    ORDER BY r.id DESC
    LIMIT 3
);

-- 3. Verificar asignaciones de tefa
SELECT '=== ASIGNACIONES DE TEFA ===' as info;
SELECT 
    r.id as reclutamiento_id,
    r.investigacion_id,
    r.estado_agendamiento,
    r.reclutador_id,
    i.nombre as investigacion_nombre,
    p.nombre as participante_nombre
FROM reclutamientos r
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
LEFT JOIN participantes p ON r.participantes_id = p.id
WHERE r.reclutador_id = '5ff1169b-f725-4a8c-bc5d-0bead2c87afc'
ORDER BY r.id DESC;
