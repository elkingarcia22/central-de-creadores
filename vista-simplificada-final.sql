-- Eliminar completamente la vista y recrearla de forma simplificada
-- Solo mostrar investigaciones en estado por agendar

-- Forzar la eliminación de la vista
DROP VIEW IF EXISTS vista_reclutamientos_completa CASCADE;

-- Crear la vista simplificada
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
    -- Campos de participantes (valores por defecto)
    0 AS participantes_reclutados,
    -- Progreso del reclutamiento
    '0/0' AS progreso_reclutamiento,
    0 AS porcentaje_completitud,
    -- Tipo de reclutamiento (siempre automático para investigaciones)
    'automatico' AS tipo_reclutamiento,
    -- ID del reclutamiento (null para investigaciones automáticas)
    NULL AS reclutamiento_id
FROM investigaciones i
LEFT JOIN usuarios rp ON i.responsable_id = rp.id
LEFT JOIN usuarios imp ON i.implementador_id = imp.id
LEFT JOIN estado_reclutamiento_cat er ON er.nombre = 'Pendiente'
WHERE i.estado = 'por_agendar'  -- Solo investigaciones en estado por agendar
ORDER BY i.creado_el DESC; 