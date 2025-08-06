-- Vista simplificada sin tabla libretos
-- Primero eliminar vista anterior si existe
DROP VIEW IF EXISTS vista_reclutamientos_completa;

-- Crear vista simplificada usando solo tablas existentes
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
    
    -- Datos del libreto (usando campo libreto de investigaciones)
    i.libreto as titulo_libreto,
    COALESCE(i.numero_participantes, 0) as participantes_requeridos,
    
    -- Estado del reclutamiento
    er.nombre as estado_reclutamiento,
    er.color as color_estado,
    er.orden as orden_estado,
    
    -- Responsable (usuario que creó la investigación)
    u.nombre as responsable_nombre,
    u.apellido as responsable_apellido,
    u.email as responsable_email,
    
    -- Implementador (usuario asignado a la investigación)
    impl.nombre as implementador_nombre,
    impl.apellido as implementador_apellido,
    impl.email as implementador_email,
    
    -- Contar participantes actuales (si existe tabla participantes)
    COALESCE(COUNT(p.id), 0) as participantes_actuales,
    
    -- Calcular progreso
    CASE 
        WHEN COALESCE(i.numero_participantes, 0) > 0 THEN 
            ROUND((COUNT(p.id)::decimal / i.numero_participantes::decimal) * 100, 1)
        ELSE 0 
    END as progreso_porcentaje,
    
    -- Determinar si está completo
    CASE 
        WHEN COUNT(p.id) >= COALESCE(i.numero_participantes, 0) THEN true
        ELSE false 
    END as reclutamiento_completo

FROM reclutamientos r
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
LEFT JOIN estado_reclutamiento_cat er ON r.estado_reclutamiento_id = er.id
LEFT JOIN usuarios u ON i.usuario_id = u.id
LEFT JOIN usuarios impl ON i.implementador_id = impl.id
LEFT JOIN participantes p ON i.id = p.investigacion_id

GROUP BY 
    r.id, r.investigacion_id, r.libreto_id, r.estado_reclutamiento_id, 
    r.creado_en, r.actualizado_en,
    i.titulo, i.descripcion, i.estado, i.libreto, i.numero_participantes,
    er.nombre, er.color, er.orden,
    u.nombre, u.apellido, u.email,
    impl.nombre, impl.apellido, impl.email

ORDER BY r.creado_en DESC; 