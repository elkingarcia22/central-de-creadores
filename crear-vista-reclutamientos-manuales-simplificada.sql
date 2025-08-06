-- Versión simplificada de la vista para reclutamientos manuales
-- que aparecerán en el tab de reclutamiento de las investigaciones

CREATE OR REPLACE VIEW vista_reclutamientos_manuales AS
SELECT 
    r.id AS reclutamiento_id,
    r.investigacion_id,
    COALESCE(i.nombre, 'Sin investigación') AS investigacion_nombre,
    COALESCE(i.estado, 'Sin estado') AS estado_investigacion,
    i.fecha_inicio AS investigacion_fecha_inicio,
    i.fecha_fin AS investigacion_fecha_fin,
    i.riesgo AS investigacion_riesgo,
    r.creado_en,
    r.actualizado_en,
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
    -- Tipo de reclutamiento
    'manual' AS tipo_reclutamiento,
    -- Campos específicos del reclutamiento
    r.titulo AS reclutamiento_titulo,
    r.descripcion AS reclutamiento_descripcion,
    r.fecha_inicio AS reclutamiento_fecha_inicio,
    r.fecha_fin AS reclutamiento_fecha_fin,
    r.creado_por AS reclutamiento_creado_por
FROM reclutamientos r
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
LEFT JOIN libretos_investigacion l ON r.libreto = l.id
LEFT JOIN usuarios rp ON r.responsable_id = rp.id
LEFT JOIN usuarios imp ON r.implementador_id = imp.id
LEFT JOIN estados_reclutamiento er ON r.estado_reclutamiento_id = er.id
LEFT JOIN (
    SELECT 
        pr.reclutamiento_id,
        COUNT(*) as total
    FROM participantes_reclutamiento pr
    WHERE pr.estado = 'activo'
    GROUP BY pr.reclutamiento_id
) participantes_count ON r.id = participantes_count.reclutamiento_id
ORDER BY r.creado_en DESC; 