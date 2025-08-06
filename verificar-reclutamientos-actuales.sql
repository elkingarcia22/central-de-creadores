-- ====================================
-- VERIFICAR RECLUTAMIENTOS ACTUALES
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar todos los reclutamientos actuales con información completa
SELECT 
    r.id as reclutamiento_id,
    r.investigacion_id,
    r.participantes_id,
    r.fecha_asignado,
    r.fecha_sesion,
    r.reclutador_id,
    r.creado_por,
    r.estado_agendamiento,
    i.nombre as investigacion_nombre,
    i.estado as investigacion_estado,
    p.nombre as participante_nombre
FROM reclutamientos r
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
LEFT JOIN participantes p ON r.participantes_id = p.id
ORDER BY r.fecha_asignado DESC;

-- 2. Verificar si hay reclutamientos con investigaciones sin nombre
SELECT 
    r.id as reclutamiento_id,
    r.investigacion_id,
    i.nombre as investigacion_nombre,
    CASE 
        WHEN i.nombre IS NULL THEN 'SIN NOMBRE'
        WHEN i.nombre = '' THEN 'NOMBRE VACÍO'
        WHEN i.nombre = 'null' THEN 'NOMBRE NULL'
        ELSE 'CON NOMBRE'
    END as estado_nombre
FROM reclutamientos r
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
ORDER BY r.fecha_asignado DESC;

-- 3. Verificar la vista actual
SELECT 
    reclutamiento_id,
    investigacion_id,
    investigacion_nombre,
    participante_nombre,
    estado_reclutamiento_nombre,
    fecha_asignado
FROM vista_reclutamientos_completa
ORDER BY fecha_asignado DESC; 