-- Verificar reclutamientos con participantes (sin usar estado_reclutamiento_id)
SELECT 
    r.id as reclutamiento_id,
    r.investigacion_id,
    r.fecha_sesion,
    r.duracion_sesion,
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
WHERE (r.participantes_id IS NOT NULL OR r.participantes_internos_id IS NOT NULL OR r.participantes_friend_family_id IS NOT NULL)
ORDER BY r.updated_at DESC
LIMIT 10;
