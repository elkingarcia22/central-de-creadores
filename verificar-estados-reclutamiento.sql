-- Verificar estados de reclutamiento
SELECT id, nombre, activo, color, orden FROM estado_reclutamiento_cat ORDER BY orden, nombre;

-- Verificar reclutamientos con su estado actual
SELECT 
    r.id as reclutamiento_id,
    r.investigacion_id,
    r.estado_reclutamiento_id,
    erc.nombre as estado_reclutamiento_nombre,
    r.participantes_id,
    r.participantes_internos_id,
    r.participantes_friend_family_id,
    CASE 
        WHEN r.participantes_id IS NOT NULL OR r.participantes_internos_id IS NOT NULL OR r.participantes_friend_family_id IS NOT NULL 
        THEN 'SÍ'
        ELSE 'NO'
    END as tiene_participantes
FROM reclutamientos r
LEFT JOIN estado_reclutamiento_cat erc ON r.estado_reclutamiento_id = erc.id
WHERE (r.participantes_id IS NOT NULL OR r.participantes_internos_id IS NOT NULL OR r.participantes_friend_family_id IS NOT NULL)
ORDER BY r.updated_at DESC;
