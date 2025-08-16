-- ====================================
-- ACTUALIZAR RECLUTAMIENTO CON FECHA DE SESIÓN
-- ====================================
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar reclutamientos existentes
SELECT '=== RECLUTAMIENTOS EXISTENTES ===' as info;
SELECT 
    r.id,
    r.investigacion_id,
    r.fecha_sesion,
    r.estado_agendamiento,
    eac.nombre as estado_nombre,
    r.participantes_id,
    r.participantes_internos_id,
    r.participantes_friend_family_id
FROM reclutamientos r
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
ORDER BY r.created_at DESC
LIMIT 5;

-- 2. Obtener ID del estado "En progreso"
SELECT '=== ESTADO EN PROGRESO ===' as info;
SELECT id, nombre FROM estado_agendamiento_cat WHERE nombre = 'En progreso';

-- 3. Actualizar el primer reclutamiento con fecha de sesión (mañana a las 2 PM)
SELECT '=== ACTUALIZANDO RECLUTAMIENTO ===' as info;

-- Obtener el primer reclutamiento sin fecha de sesión
WITH primer_reclutamiento AS (
    SELECT id, investigacion_id, participantes_id
    FROM reclutamientos 
    WHERE fecha_sesion IS NULL
    ORDER BY created_at DESC
    LIMIT 1
)
UPDATE reclutamientos 
SET 
    fecha_sesion = (NOW() + INTERVAL '1 day' + INTERVAL '14 hours')::timestamp with time zone,
    duracion_sesion = 60,
    estado_agendamiento = (SELECT id FROM estado_agendamiento_cat WHERE nombre = 'En progreso')
WHERE id IN (SELECT id FROM primer_reclutamiento);

-- 4. Verificar la actualización
SELECT '=== VERIFICANDO ACTUALIZACIÓN ===' as info;
SELECT 
    r.id,
    r.investigacion_id,
    r.fecha_sesion,
    r.duracion_sesion,
    r.estado_agendamiento,
    eac.nombre as estado_nombre,
    r.participantes_id,
    r.participantes_internos_id,
    r.participantes_friend_family_id,
    NOW() as fecha_actual,
    CASE 
        WHEN r.fecha_sesion IS NULL THEN 'Sin fecha'
        WHEN NOW() < r.fecha_sesion THEN 'Futura'
        WHEN NOW() >= r.fecha_sesion AND NOW() <= (r.fecha_sesion + (COALESCE(r.duracion_sesion, 60) || ' minutes')::INTERVAL) THEN 'En curso'
        ELSE 'Pasada'
    END as estado_calculado
FROM reclutamientos r
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE r.fecha_sesion IS NOT NULL
ORDER BY r.fecha_sesion DESC
LIMIT 3;

-- 5. Verificar en la vista
SELECT '=== VERIFICANDO EN LA VISTA ===' as info;
SELECT 
    reclutamiento_id,
    investigacion_id,
    titulo_investigacion,
    estado_reclutamiento_id,
    estado_reclutamiento_nombre,
    estado_reclutamiento_color,
    fecha_sesion,
    participantes_requeridos,
    participantes_actuales
FROM vista_reclutamientos_completa
WHERE fecha_sesion IS NOT NULL
ORDER BY fecha_sesion DESC
LIMIT 3;
