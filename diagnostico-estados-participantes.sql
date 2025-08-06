-- Diagnóstico de estados de participantes
-- Verificar por qué no se muestran los estados en las cards

-- 1. Verificar estructura de la tabla reclutamientos
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'reclutamientos' 
AND column_name LIKE '%estado%'
ORDER BY ordinal_position;

-- 2. Verificar datos de reclutamientos con estados
SELECT 
    r.id,
    r.investigacion_id,
    r.estado_agendamiento,
    eac.nombre as estado_nombre,
    eac.color as estado_color,
    r.participantes_id,
    r.participantes_internos_id,
    r.participantes_friend_family_id,
    r.fecha_sesion,
    r.duracion_sesion
FROM reclutamientos r
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
LIMIT 10;

-- 3. Verificar estados disponibles
SELECT 
    id,
    nombre,
    color,
    activo
FROM estado_agendamiento_cat
ORDER BY orden;

-- 4. Verificar participantes con estados
SELECT 
    p.id,
    p.nombre,
    p.tipo_participante,
    r.id as reclutamiento_id,
    r.estado_agendamiento,
    eac.nombre as estado_nombre,
    eac.color as estado_color
FROM participantes p
JOIN reclutamientos r ON (
    p.id = r.participantes_id OR 
    p.id = r.participantes_internos_id OR 
    p.id = r.participantes_friend_family_id
)
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
LIMIT 10; 