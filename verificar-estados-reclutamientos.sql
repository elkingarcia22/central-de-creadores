-- Verificar reclutamientos con participantes pero en estado 'Pendiente'
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
        WHEN r.participantes_id IS NOT NULL THEN 'Externo'
        WHEN r.participantes_internos_id IS NOT NULL THEN 'Interno'
        WHEN r.participantes_friend_family_id IS NOT NULL THEN 'Friend & Family'
        ELSE 'Sin participante'
    END as tipo_participante,
    CASE 
        WHEN r.participantes_id IS NOT NULL OR r.participantes_internos_id IS NOT NULL OR r.participantes_friend_family_id IS NOT NULL 
        THEN 'SÍ'
        ELSE 'NO'
    END as tiene_participantes
FROM reclutamientos r
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE (r.participantes_id IS NOT NULL OR r.participantes_internos_id IS NOT NULL OR r.participantes_friend_family_id IS NOT NULL)
ORDER BY r.updated_at DESC;

-- Verificar IDs de estados disponibles
SELECT id, nombre FROM estado_agendamiento_cat ORDER BY nombre;

-- Verificar por qué los reclutamientos no tienen estado_agendamiento

-- 1. Ver estructura de reclutamientos
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'reclutamientos' 
AND column_name LIKE '%estado%'
ORDER BY ordinal_position;

-- 2. Ver datos de reclutamientos con estados
SELECT 
    id,
    investigacion_id,
    estado_agendamiento,
    fecha_sesion,
    participantes_id,
    participantes_internos_id,
    participantes_friend_family_id
FROM reclutamientos
LIMIT 10;

-- 3. Ver estados disponibles
SELECT 
    id,
    nombre,
    activo
FROM estado_agendamiento_cat
ORDER BY nombre;

-- 4. Verificar si hay reclutamientos con estado NULL
SELECT 
    COUNT(*) as total_reclutamientos,
    COUNT(estado_agendamiento) as con_estado,
    COUNT(*) - COUNT(estado_agendamiento) as sin_estado
FROM reclutamientos;
