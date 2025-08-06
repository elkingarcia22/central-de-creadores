-- Verificar qué investigaciones en estado por agendar tienen reclutamientos asociados
SELECT 
    i.id AS investigacion_id,
    i.nombre AS investigacion_nombre,
    i.creado_el AS investigacion_creado_el,
    r.id AS reclutamiento_id,
    r.fecha_asignado AS reclutamiento_fecha_asignado
FROM investigaciones i
LEFT JOIN reclutamientos r ON i.id = r.investigacion_id
WHERE i.estado = 'por_agendar'
ORDER BY i.creado_el DESC; 