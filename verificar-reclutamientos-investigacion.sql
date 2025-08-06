-- Verificar todos los reclutamientos de la investigación específica
SELECT 
    'Reclutamientos de la investigación' as status,
    r.id as reclutamiento_id,
    r.investigacion_id,
    r.participantes_id,
    r.fecha_asignado,
    r.fecha_sesion,
    r.estado_agendamiento,
    p.nombre as participante_nombre
FROM reclutamientos r
LEFT JOIN participantes p ON r.participantes_id = p.id
WHERE r.investigacion_id = '3b5b3e72-953d-4b54-9a93-42209c1d352d'
ORDER BY r.fecha_asignado DESC; 