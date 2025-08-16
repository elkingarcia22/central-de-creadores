-- ====================================
-- VERIFICAR ESTADOS ACTUALES DE RECLUTAMIENTOS
-- ====================================
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar reclutamientos con sus estados actuales
SELECT '=== RECLUTAMIENTOS CON ESTADOS ACTUALES ===' as info;
SELECT 
    r.id as reclutamiento_id,
    r.investigacion_id,
    r.fecha_sesion,
    r.duracion_sesion,
    r.estado_agendamiento,
    eac.nombre as estado_nombre,
    r.participantes_id,
    r.participantes_internos_id,
    r.participantes_friend_family_id,
    CASE 
        WHEN r.participantes_id IS NOT NULL OR r.participantes_internos_id IS NOT NULL OR r.participantes_friend_family_id IS NOT NULL 
        THEN 'SÍ'
        ELSE 'NO'
    END as tiene_participantes,
    NOW() as fecha_actual,
    CASE 
        WHEN r.fecha_sesion IS NULL THEN 'Sin fecha'
        WHEN NOW() < r.fecha_sesion THEN 'Futura'
        WHEN NOW() >= r.fecha_sesion AND NOW() <= (r.fecha_sesion + (COALESCE(r.duracion_sesion, 60) || ' minutes')::INTERVAL) THEN 'En curso'
        ELSE 'Pasada'
    END as estado_calculado
FROM reclutamientos r
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
ORDER BY r.fecha_sesion DESC NULLS LAST;

-- 2. Verificar estados disponibles
SELECT '=== ESTADOS DISPONIBLES ===' as info;
SELECT 
    id,
    nombre,
    activo
FROM estado_agendamiento_cat
ORDER BY nombre;

-- 3. Verificar reclutamientos sin fecha de sesión
SELECT '=== RECLUTAMIENTOS SIN FECHA DE SESIÓN ===' as info;
SELECT 
    COUNT(*) as total_sin_fecha,
    COUNT(CASE WHEN participantes_id IS NOT NULL OR participantes_internos_id IS NOT NULL OR participantes_friend_family_id IS NOT NULL THEN 1 END) as con_participantes,
    COUNT(CASE WHEN participantes_id IS NULL AND participantes_internos_id IS NULL AND participantes_friend_family_id IS NULL THEN 1 END) as sin_participantes
FROM reclutamientos 
WHERE fecha_sesion IS NULL;

-- 4. Verificar reclutamientos con fecha de sesión
SELECT '=== RECLUTAMIENTOS CON FECHA DE SESIÓN ===' as info;
SELECT 
    COUNT(*) as total_con_fecha,
    COUNT(CASE WHEN NOW() < fecha_sesion THEN 1 END) as sesiones_futuras,
    COUNT(CASE WHEN NOW() >= fecha_sesion AND NOW() <= (fecha_sesion + (COALESCE(duracion_sesion, 60) || ' minutes')::INTERVAL) THEN 1 END) as sesiones_en_curso,
    COUNT(CASE WHEN NOW() > (fecha_sesion + (COALESCE(duracion_sesion, 60) || ' minutes')::INTERVAL) THEN 1 END) as sesiones_pasadas
FROM reclutamientos 
WHERE fecha_sesion IS NOT NULL;

-- 5. Verificar vista de reclutamientos completa
SELECT '=== DATOS DE LA VISTA ===' as info;
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
LIMIT 5;
