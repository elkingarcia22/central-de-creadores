-- ====================================
-- VERIFICAR ASIGNACIONES DE AGENDAMIENTO DE TEFA
-- ====================================
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar el ID del usuario tefa
SELECT '=== ID DEL USUARIO TEFA ===' as info;
SELECT id, email FROM auth.users WHERE email = 'tefa@gmail.com';

-- 2. Verificar reclutamientos donde tefa es responsable de agendamiento
SELECT '=== RECLUTAMIENTOS COMO RESPONSABLE DE AGENDAMIENTO ===' as info;
SELECT 
    r.id as reclutamiento_id,
    r.investigacion_id,
    r.estado_agendamiento,
    r.responsable_agendamiento,
    r.fecha_sesion,
    r.hora_sesion,
    i.nombre as investigacion_nombre,
    p.nombre as participante_nombre,
    p.email as participante_email
FROM reclutamientos r
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
LEFT JOIN participantes p ON r.participante_id = p.id
WHERE r.responsable_agendamiento = '5ff1169b-f725-4a8c-bc5d-0bead2c87afc';

-- 3. Verificar todos los reclutamientos para ver cuáles deberían aparecer
SELECT '=== TODOS LOS RECLUTAMIENTOS ===' as info;
SELECT 
    r.id as reclutamiento_id,
    r.investigacion_id,
    r.estado_agendamiento,
    r.responsable_agendamiento,
    i.nombre as investigacion_nombre,
    CASE 
        WHEN r.responsable_agendamiento = '5ff1169b-f725-4a8c-bc5d-0bead2c87afc' THEN '✅ TEFA'
        ELSE '❌ OTRO'
    END as es_tefa
FROM reclutamientos r
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
ORDER BY r.creado_el DESC;

-- 4. Verificar si hay reclutamientos sin responsable de agendamiento
SELECT '=== RECLUTAMIENTOS SIN RESPONSABLE DE AGENDAMIENTO ===' as info;
SELECT 
    r.id as reclutamiento_id,
    r.investigacion_id,
    r.estado_agendamiento,
    r.responsable_agendamiento,
    i.nombre as investigacion_nombre
FROM reclutamientos r
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
WHERE r.responsable_agendamiento IS NULL;

-- 5. Asignar a tefa como responsable de agendamiento en algunos reclutamientos si no tiene
SELECT '=== ASIGNAR A TEFA COMO RESPONSABLE DE AGENDAMIENTO ===' as info;

-- Asignar a tefa en el primer reclutamiento que no tenga responsable
UPDATE reclutamientos 
SET responsable_agendamiento = '5ff1169b-f725-4a8c-bc5d-0bead2c87afc'
WHERE id = (
    SELECT r.id 
    FROM reclutamientos r
    WHERE r.responsable_agendamiento IS NULL
    LIMIT 1
);

-- 6. Verificar reclutamientos después de la asignación
SELECT '=== RECLUTAMIENTOS DESPUÉS DE ASIGNACIÓN ===' as info;
SELECT 
    r.id as reclutamiento_id,
    r.investigacion_id,
    r.estado_agendamiento,
    r.responsable_agendamiento,
    i.nombre as investigacion_nombre,
    CASE 
        WHEN r.responsable_agendamiento = '5ff1169b-f725-4a8c-bc5d-0bead2c87afc' THEN '✅ TEFA'
        ELSE '❌ OTRO'
    END as es_tefa
FROM reclutamientos r
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
WHERE r.responsable_agendamiento = '5ff1169b-f725-4a8c-bc5d-0bead2c87afc'
ORDER BY r.creado_el DESC;
