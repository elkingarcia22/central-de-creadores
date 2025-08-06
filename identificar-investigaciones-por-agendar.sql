-- Identificar todas las investigaciones en estado por agendar
SELECT 
    i.id,
    i.nombre,
    i.estado,
    i.creado_el,
    i.actualizado_el,
    i.responsable_id,
    i.implementador_id,
    i.libreto,
    -- Verificar si tiene reclutamiento asociado
    r.id AS reclutamiento_id,
    r.investigacion_id AS reclutamiento_investigacion_id,
    r.estado_agendamiento,
    r.fecha_asignado,
    r.fecha_sesion
FROM investigaciones i
LEFT JOIN reclutamientos r ON i.id = r.investigacion_id
WHERE i.estado = 'por_agendar'
ORDER BY i.creado_el DESC; 