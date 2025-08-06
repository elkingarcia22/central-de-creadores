-- Crear vista principal de reclutamiento que muestra investigaciones en estado "por_agendar"
CREATE OR REPLACE VIEW vista_reclutamientos AS
SELECT 
    i.id,
    i.nombre,
    i.descripcion,
    i.estado,
    i.estado_reclutamiento,
    i.riesgo,
    i.riesgo_automatico,
    i.libreto,
    i.tipo_prueba,
    i.plataforma,
    i.link_prueba,
    i.link_resultados,
    i.fecha_seguimiento,
    i.notas_seguimiento,
    i.responsable_id,
    i.implementador_id,
    i.tipo_investigacion_id,
    i.periodo_id,
    i.fecha_inicio,
    i.fecha_fin,
    i.producto_id,
    i.tipo_sesion,
    i.creado_por,
    i.creado_el,
    i.actualizado_el,
    -- Progreso de reclutamiento basado en libreto
    COALESCE(l.numero_participantes, 0) as participantes_objetivo,
    0 as participantes_actuales, -- Por ahora 0, se actualizará cuando tengamos la relación correcta
    0 as porcentaje_avance, -- Por ahora 0
    '0/' || COALESCE(l.numero_participantes, 0)::text as progreso_reclutamiento
FROM investigaciones i
LEFT JOIN libretos_investigacion l ON i.id = l.investigacion_id
WHERE i.estado_reclutamiento = '0d68ea67-ea95-4c0d-ae16-161b62c2b6b8'; -- Pendiente 