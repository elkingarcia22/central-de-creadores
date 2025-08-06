-- Verificar reclutamientos que tienen participantes pero están en estado 'Pendiente'
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
    END as tipo_participante
FROM reclutamientos r
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
WHERE (r.participantes_id IS NOT NULL OR r.participantes_internos_id IS NOT NULL OR r.participantes_friend_family_id IS NOT NULL)
AND eac.nombre = 'Pendiente'
ORDER BY r.updated_at DESC;

-- Contar total de reclutamientos por estado
SELECT 
    eac.nombre as estado,
    COUNT(*) as cantidad
FROM reclutamientos r
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
GROUP BY eac.nombre, eac.id
ORDER BY cantidad DESC;
