-- Primero eliminar la vista si existe
DROP VIEW IF EXISTS vista_reclutamientos_completa;

-- Crear la vista final corregida
CREATE VIEW vista_reclutamientos_completa AS
SELECT 
    r.id as reclutamiento_id,
    r.investigacion_id,
    r.libreto_id,
    r.estado_reclutamiento_id,
    r.creado_en,
    r.actualizado_en,
    
    -- Datos de la investigación
    i.titulo as titulo_investigacion,
    i.descripcion as descripcion_investigacion,
    i.estado as estado_investigacion,
    
    -- Datos del libreto
    l.titulo as titulo_libreto,
    l.numero_participantes as participantes_requeridos,
    
    -- Estado del reclutamiento
    er.nombre as estado_reclutamiento,
    er.color as color_estado,
    er.orden as orden_estado,
    
    -- Responsable (usuario que creó la investigación)
    u.nombre as responsable_nombre,
    u.apellido as responsable_apellido,
    u.email as responsable_email,
    
    -- Implementador (usuario asignado al libreto)
    impl.nombre as implementador_nombre,
    impl.apellido as implementador_apellido,
    impl.email as implementador_email,
    
    -- Contar participantes actuales del libreto
    COALESCE(COUNT(p.id), 0) as participantes_actuales,
    
    -- Calcular progreso
    CASE 
        WHEN l.numero_participantes > 0 THEN 
            ROUND((COUNT(p.id)::decimal / l.numero_participantes::decimal) * 100, 1)
        ELSE 0 
    END as progreso_porcentaje,
    
    -- Determinar si está completo
    CASE 
        WHEN COUNT(p.id) >= l.numero_participantes THEN true
        ELSE false 
    END as reclutamiento_completo

FROM reclutamientos r
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
LEFT JOIN libretos l ON r.libreto_id = l.id
LEFT JOIN estado_reclutamiento_cat er ON r.estado_reclutamiento_id = er.id
LEFT JOIN usuarios u ON i.usuario_id = u.id
LEFT JOIN usuarios impl ON l.usuario_id = impl.id
LEFT JOIN participantes p ON l.id = p.libreto_id

GROUP BY 
    r.id, r.investigacion_id, r.libreto_id, r.estado_reclutamiento_id, 
    r.creado_en, r.actualizado_en,
    i.titulo, i.descripcion, i.estado,
    l.titulo, l.numero_participantes,
    er.nombre, er.color, er.orden,
    u.nombre, u.apellido, u.email,
    impl.nombre, impl.apellido, impl.email

ORDER BY r.creado_en DESC; 