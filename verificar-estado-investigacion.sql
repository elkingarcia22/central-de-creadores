-- Verificar si el estado se maneja a través de investigaciones
SELECT 
    r.id as reclutamiento_id,
    r.investigacion_id,
    i.estado as estado_investigacion,
    r.fecha_sesion,
    r.participantes_id,
    r.participantes_internos_id,
    r.participantes_friend_family_id,
    CASE 
        WHEN r.participantes_id IS NOT NULL OR r.participantes_internos_id IS NOT NULL OR r.participantes_friend_family_id IS NOT NULL 
        THEN 'SÍ'
        ELSE 'NO'
    END as tiene_participantes
FROM reclutamientos r
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
WHERE (r.participantes_id IS NOT NULL OR r.participantes_internos_id IS NOT NULL OR r.participantes_friend_family_id IS NOT NULL)
ORDER BY r.updated_at DESC
LIMIT 10;

-- Verificar estructura de la tabla investigaciones
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'investigaciones' 
AND column_name LIKE '%estado%'
ORDER BY column_name; 