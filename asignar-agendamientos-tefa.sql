
-- ====================================
-- ASIGNAR AGENDAMIENTOS A TEFA
-- ====================================
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar el ID del usuario tefa
SELECT '=== ID DEL USUARIO TEFA ===' as info;
SELECT id, email FROM auth.users WHERE email = 'tefa@gmail.com';

-- 2. Verificar reclutamientos disponibles para asignar
SELECT '=== RECLUTAMIENTOS DISPONIBLES ===' as info;
SELECT 
    r.id as reclutamiento_id,
    r.investigacion_id,
    r.estado_agendamiento,
    r.responsable_agendamiento,
    i.nombre as investigacion_nombre,
    p.nombre as participante_nombre
FROM reclutamientos r
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
LEFT JOIN participantes p ON r.participante_id = p.id
WHERE r.responsable_agendamiento IS NULL
ORDER BY r.creado_el DESC
LIMIT 5;

-- 3. Asignar a tefa como responsable de agendamiento en algunos reclutamientos
SELECT '=== ASIGNANDO AGENDAMIENTOS A TEFA ===' as info;

-- Asignar el primer reclutamiento disponible
UPDATE reclutamientos 
SET responsable_agendamiento = '5ff1169b-f725-4a8c-bc5d-0bead2c87afc'
WHERE id = (
    SELECT r.id 
    FROM reclutamientos r
    WHERE r.responsable_agendamiento IS NULL
    ORDER BY r.creado_el DESC
    LIMIT 1
);

-- Asignar el segundo reclutamiento disponible
UPDATE reclutamientos 
SET responsable_agendamiento = '5ff1169b-f725-4a8c-bc5d-0bead2c87afc'
WHERE id = (
    SELECT r.id 
    FROM reclutamientos r
    WHERE r.responsable_agendamiento IS NULL
    ORDER BY r.creado_el DESC
    LIMIT 1
);

-- 4. Verificar asignaciones después de la actualización
SELECT '=== ASIGNACIONES DESPUÉS DE ACTUALIZACIÓN ===' as info;
SELECT 
    r.id as reclutamiento_id,
    r.investigacion_id,
    r.estado_agendamiento,
    r.responsable_agendamiento,
    i.nombre as investigacion_nombre,
    p.nombre as participante_nombre,
    p.email as participante_email,
    r.fecha_sesion,
    r.hora_sesion
FROM reclutamientos r
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
LEFT JOIN participantes p ON r.participante_id = p.id
WHERE r.responsable_agendamiento = '5ff1169b-f725-4a8c-bc5d-0bead2c87afc'
ORDER BY r.creado_el DESC;

-- 5. Contar total de asignaciones
SELECT '=== TOTAL DE ASIGNACIONES ===' as info;
SELECT 
    COUNT(*) as total_asignaciones,
    COUNT(CASE WHEN r.fecha_sesion IS NOT NULL THEN 1 END) as con_fecha,
    COUNT(CASE WHEN r.fecha_sesion IS NULL THEN 1 END) as sin_fecha
FROM reclutamientos r
WHERE r.responsable_agendamiento = '5ff1169b-f725-4a8c-bc5d-0bead2c87afc';