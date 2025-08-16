-- ====================================
-- ASIGNAR TEFA EN INVESTIGACIÓN ESPECÍFICA
-- ====================================
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar el ID del usuario tefa
SELECT '=== ID DEL USUARIO TEFA ===' as info;
SELECT id, email FROM auth.users WHERE email = 'tefa@gmail.com';

-- 2. Buscar la investigación "prueba investigacion nueva"
SELECT '=== INVESTIGACIÓN PRUEBA INVESTIGACION NUEVA ===' as info;
SELECT 
    id,
    nombre,
    estado,
    creado_el
FROM investigaciones 
WHERE nombre ILIKE '%prueba investigacion nueva%';

-- 3. Verificar reclutamientos existentes en esa investigación
SELECT '=== RECLUTAMIENTOS EXISTENTES ===' as info;
SELECT 
    r.id as reclutamiento_id,
    r.investigacion_id,
    r.participante_id,
    r.estado_agendamiento,
    r.responsable_agendamiento,
    p.nombre as participante_nombre,
    CASE 
        WHEN r.responsable_agendamiento = '5ff1169b-f725-4a8c-bc5d-0bead2c87afc' THEN '✅ TEFA'
        ELSE '❌ OTRO'
    END as es_tefa
FROM reclutamientos r
LEFT JOIN participantes p ON r.participante_id = p.id
WHERE r.investigacion_id IN (
    SELECT id FROM investigaciones WHERE nombre ILIKE '%prueba investigacion nueva%'
)
ORDER BY r.creado_el DESC;

-- 4. Asignar a tefa como responsable de agendamiento en TODOS los reclutamientos de esta investigación
SELECT '=== ASIGNANDO A TEFA EN TODOS LOS RECLUTAMIENTOS ===' as info;

UPDATE reclutamientos 
SET responsable_agendamiento = '5ff1169b-f725-4a8c-bc5d-0bead2c87afc'
WHERE investigacion_id IN (
    SELECT id FROM investigaciones WHERE nombre ILIKE '%prueba investigacion nueva%'
);

-- 5. Verificar asignaciones después de la actualización
SELECT '=== ASIGNACIONES DESPUÉS DE ACTUALIZACIÓN ===' as info;
SELECT 
    r.id as reclutamiento_id,
    r.investigacion_id,
    r.estado_agendamiento,
    r.responsable_agendamiento,
    i.nombre as investigacion_nombre,
    p.nombre as participante_nombre,
    r.fecha_sesion,
    r.hora_sesion,
    CASE 
        WHEN r.responsable_agendamiento = '5ff1169b-f725-4a8c-bc5d-0bead2c87afc' THEN '✅ TEFA'
        ELSE '❌ OTRO'
    END as es_tefa
FROM reclutamientos r
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
LEFT JOIN participantes p ON r.participante_id = p.id
WHERE r.responsable_agendamiento = '5ff1169b-f725-4a8c-bc5d-0bead2c87afc'
ORDER BY r.creado_el DESC;

-- 6. Contar total de asignaciones de tefa
SELECT '=== TOTAL DE ASIGNACIONES DE TEFA ===' as info;
SELECT 
    COUNT(*) as total_asignaciones,
    COUNT(CASE WHEN r.estado_agendamiento = 'd32b84d1-6209-41d9-8108-03588ca1f9b5' THEN 1 END) as pendientes_agendamiento,
    COUNT(CASE WHEN r.estado_agendamiento = 'agendada' THEN 1 END) as agendadas,
    COUNT(CASE WHEN r.estado_agendamiento = 'completada' THEN 1 END) as completadas,
    COUNT(CASE WHEN r.estado_agendamiento = 'cancelada' THEN 1 END) as canceladas
FROM reclutamientos r
WHERE r.responsable_agendamiento = '5ff1169b-f725-4a8c-bc5d-0bead2c87afc';
