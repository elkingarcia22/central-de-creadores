-- Corregir la vista de reclutamientos para que solo muestre investigaciones en estado "por agendar"
-- y no incluya reclutamientos manuales en la lista principal

DROP VIEW IF EXISTS vista_reclutamientos_completa;

CREATE VIEW vista_reclutamientos_completa AS
SELECT 
    i.id AS investigacion_id,
    i.nombre AS investigacion_nombre,
    i.estado AS estado_investigacion,
    i.fecha_inicio AS investigacion_fecha_inicio,
    i.fecha_fin AS investigacion_fecha_fin,
    i.riesgo AS investigacion_riesgo,
    i.creado_en,
    i.actualizado_en,
    -- Campos del libreto
    l.titulo AS libreto_titulo,
    l.descripcion AS libreto_descripcion,
    l.numero_participantes AS libreto_numero_participantes,
    -- Campos del responsable
    rp.nombre AS responsable_nombre,
    rp.email AS responsable_correo,
    -- Campos del implementador
    imp.nombre AS implementador_nombre,
    imp.email AS implementador_correo,
    -- Campos del estado de reclutamiento
    er.id AS estado_reclutamiento_id,
    er.nombre AS estado_reclutamiento_nombre,
    er.color AS estado_reclutamiento_color,
    er.orden AS orden_estado,
    -- Campos de participantes
    COALESCE(participantes_count.total, 0) AS participantes_reclutados,
    -- Progreso del reclutamiento
    CONCAT(COALESCE(participantes_count.total, 0), '/', COALESCE(l.numero_participantes, 0)) AS progreso_reclutamiento,
    CASE 
        WHEN l.numero_participantes > 0 THEN 
            ROUND((COALESCE(participantes_count.total, 0)::numeric / l.numero_participantes::numeric) * 100)
        ELSE 0 
    END AS porcentaje_completitud,
    -- Tipo de reclutamiento (siempre automático para investigaciones)
    'automatico' AS tipo_reclutamiento,
    -- ID del reclutamiento (null para investigaciones automáticas)
    NULL AS reclutamiento_id
FROM investigaciones i
LEFT JOIN libretos_investigacion l ON i.libreto = l.id
LEFT JOIN usuarios rp ON i.responsable_id = rp.id
LEFT JOIN usuarios imp ON i.implementador_id = imp.id
LEFT JOIN estados_reclutamiento er ON er.nombre = 'Por agendar'
LEFT JOIN (
    SELECT 
        pi.investigacion_id,
        COUNT(*) as total
    FROM participantes_internos pi
    WHERE pi.estado = 'activo'
    GROUP BY pi.investigacion_id
) participantes_count ON i.id = participantes_count.investigacion_id
WHERE i.estado = 'por_agendar'  -- Solo investigaciones en estado por agendar
ORDER BY i.creado_en DESC; 