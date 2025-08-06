-- Identificar todas las investigaciones en estado por agendar (versión simple)
SELECT 
    i.id,
    i.nombre,
    i.estado,
    i.creado_el,
    i.responsable_id,
    i.implementador_id,
    i.libreto
FROM investigaciones i
WHERE i.estado = 'por_agendar'
ORDER BY i.creado_el DESC; 