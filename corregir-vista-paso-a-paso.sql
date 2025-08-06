-- Paso 1: Eliminar la vista actual
DROP VIEW IF EXISTS vista_reclutamientos_completa;

-- Paso 2: Crear la vista corregida
CREATE VIEW vista_reclutamientos_completa AS
SELECT 
    i.id AS investigacion_id,
    i.nombre AS investigacion_nombre,
    i.estado AS estado_investigacion,
    i.fecha_inicio AS investigacion_fecha_inicio,
    i.fecha_fin AS investigacion_fecha_fin,
    i.riesgo AS investigacion_riesgo,
    i.creado_el,
    i.actualizado_el,
    COALESCE(rp.nombre, 'Sin responsable') AS responsable_nombre,
    COALESCE(rp.correo, '') AS responsable_correo,
    COALESCE(imp.nombre, 'Sin implementador') AS implementador_nombre,
    COALESCE(imp.correo, '') AS implementador_correo,
    er.id AS estado_reclutamiento_id,
    er.nombre AS estado_reclutamiento_nombre,
    er.color AS estado_reclutamiento_color,
    er.orden AS orden_estado,
    COALESCE(pi_count.count, 0) AS participantes_reclutados,
    CASE 
        WHEN li.numero_participantes IS NOT NULL THEN 
            COALESCE(pi_count.count, 0) || '/' || li.numero_participantes
        ELSE '0/0'
    END AS progreso_reclutamiento,
    CASE 
        WHEN li.numero_participantes IS NOT NULL AND li.numero_participantes > 0 THEN 
            ROUND((COALESCE(pi_count.count, 0)::numeric / li.numero_participantes::numeric) * 100)
        ELSE 0
    END AS porcentaje_completitud,
    'automatico' AS tipo_reclutamiento,
    NULL::text AS reclutamiento_id
FROM investigaciones i
LEFT JOIN usuarios rp ON i.responsable_id = rp.id
LEFT JOIN usuarios imp ON i.implementador_id = imp.id
LEFT JOIN estado_reclutamiento_cat er ON er.nombre = 'Pendiente'
LEFT JOIN libretos_investigacion li ON i.libreto::uuid = li.id
LEFT JOIN (
    SELECT 
        investigacion_id,
        COUNT(*) as count
    FROM participantes_internos
    GROUP BY investigacion_id
) pi_count ON i.id::text = pi_count.investigacion_id
WHERE i.estado = 'por_agendar'::enum_estado_investigacion
ORDER BY i.creado_el DESC; 