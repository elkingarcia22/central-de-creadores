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
    -- Calcular progreso de reclutamiento
    COALESCE(COUNT(p.id), 0) as participantes_actuales,
    COALESCE(l.numero_participantes, 0) as participantes_objetivo,
    CASE 
        WHEN COALESCE(l.numero_participantes, 0) > 0 
        THEN ROUND((COALESCE(COUNT(p.id), 0)::numeric / l.numero_participantes::numeric) * 100, 1)
        ELSE 0 
    END as porcentaje_avance,
    -- Formato de progreso: "actual/objetivo"
    COALESCE(COUNT(p.id), 0)::text || '/' || COALESCE(l.numero_participantes, 0)::text as progreso_reclutamiento
FROM investigaciones i
LEFT JOIN libretos_investigacion l ON i.id = l.investigacion_id
LEFT JOIN participantes p ON i.id = p.investigacion_id
WHERE i.estado_reclutamiento = 'por_agendar'
GROUP BY 
    i.id, i.nombre, i.descripcion, i.estado, i.estado_reclutamiento, 
    i.riesgo, i.riesgo_automatico, i.libreto, i.tipo_prueba, i.plataforma,
    i.link_prueba, i.link_resultados, i.fecha_seguimiento, i.notas_seguimiento,
    i.responsable_id, i.implementador_id, i.tipo_investigacion_id, i.periodo_id,
    i.fecha_inicio, i.fecha_fin, i.producto_id, i.tipo_sesion, i.creado_por, 
    i.creado_el, i.actualizado_el, l.numero_participantes; 