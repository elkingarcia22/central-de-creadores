-- Vista que solo muestra investigaciones en estado "por agendar"
-- Sin depender de la tabla reclutamientos

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
    -- Campos del libreto (usando COALESCE para evitar errores)
    COALESCE(l.titulo, 'Sin libreto') AS libreto_titulo,
    COALESCE(l.descripcion, '') AS libreto_descripcion,
    COALESCE(l.numero_participantes, 0) AS libreto_numero_participantes,
    -- Campos del responsable (usando COALESCE para evitar errores)
    COALESCE(rp.nombre, 'Sin responsable') AS responsable_nombre,
    COALESCE(rp.correo, '') AS responsable_correo,
    -- Campos del implementador (usando COALESCE para evitar errores)
    COALESCE(imp.nombre, 'Sin implementador') AS implementador_nombre,
    COALESCE(imp.correo, '') AS implementador_correo,
    -- Campos del estado de reclutamiento
    er.id AS estado_reclutamiento_id,
    er.nombre AS estado_reclutamiento_nombre,
    er.color AS estado_reclutamiento_color,
    er.orden AS orden_estado,
    -- Campos de participantes (usando COALESCE para evitar errores)
    COALESCE(participantes_count.total, 0) AS participantes_reclutados,
    -- Progreso del reclutamiento
    CONCAT(COALESCE(participantes_count.total, 0), '/', COALESCE(l.numero_participantes, 0)) AS progreso_reclutamiento,
    CASE 
        WHEN COALESCE(l.numero_participantes, 0) > 0 THEN 
            ROUND((COALESCE(participantes_count.total, 0)::numeric / l.numero_participantes::numeric) * 100)
        ELSE 0 
    END AS porcentaje_completitud,
    -- Tipo de reclutamiento (siempre automático para investigaciones)
    'automatico' AS tipo_reclutamiento,
    -- ID del reclutamiento (null para investigaciones automáticas)
    NULL AS reclutamiento_id
FROM investigaciones i
LEFT JOIN libretos_investigacion l ON i.libreto::uuid = l.id
LEFT JOIN usuarios rp ON i.responsable_id = rp.id
LEFT JOIN usuarios imp ON i.implementador_id = imp.id
LEFT JOIN estados_reclutamiento er ON er.nombre = 'Pendiente'
LEFT JOIN (
    SELECT 
        pi.investigacion_id,
        COUNT(*) as total
    FROM participantes_internos pi
    WHERE pi.estado = 'activo'
    GROUP BY pi.investigacion_id
) participantes_count ON i.id = participantes_count.investigacion_id
WHERE i.estado = 'pendiente'  -- Solo investigaciones en estado pendiente
ORDER BY i.creado_en DESC; 