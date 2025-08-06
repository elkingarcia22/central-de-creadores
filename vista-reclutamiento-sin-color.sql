-- ====================================
-- VISTA RECLUTAMIENTOS SIN COLUMNA COLOR
-- ====================================

-- Crear vista que combine investigaciones con libretos_investigacion
-- Usando colores por defecto basados en el nombre del estado
CREATE OR REPLACE VIEW vista_reclutamientos_completa AS
SELECT 
    i.id,
    i.nombre as investigacion_nombre,
    i.fecha_inicio,
    i.fecha_fin,
    i.estado as estado_investigacion,
    i.estado_reclutamiento,
    i.responsable_id,
    i.implementador_id,
    i.riesgo_automatico,
    i.creado_el,
    i.actualizado_el,
    
    -- Datos del libreto
    li.id as libreto_id,
    li.numero_participantes,
    li.nombre_sesion,
    li.duracion_estimada,
    li.descripcion_general,
    
    -- Datos de usuarios
    resp.full_name as responsable_nombre,
    resp.email as responsable_email,
    impl.full_name as implementador_nombre,
    impl.email as implementador_email,
    
    -- Datos de catálogos
    er.nombre as estado_reclutamiento_nombre,
    -- Color por defecto basado en el nombre del estado
    CASE 
        WHEN er.nombre ILIKE '%pendiente%' THEN '#F59E0B'
        WHEN er.nombre ILIKE '%progreso%' THEN '#3B82F6'
        WHEN er.nombre ILIKE '%completado%' THEN '#10B981'
        WHEN er.nombre ILIKE '%cancelado%' THEN '#EF4444'
        ELSE '#6B7280'
    END as estado_reclutamiento_color,
    
    -- Cálculos
    CASE 
        WHEN li.numero_participantes IS NULL OR li.numero_participantes = 0 THEN 0
        ELSE COALESCE(array_length(li.usuarios_participantes, 1), 0)
    END as participantes_actuales,
    
    CASE 
        WHEN li.numero_participantes IS NULL OR li.numero_participantes = 0 THEN 0
        ELSE ROUND(
            (COALESCE(array_length(li.usuarios_participantes, 1), 0)::DECIMAL / li.numero_participantes::DECIMAL) * 100, 
            1
        )
    END as progreso_reclutamiento

FROM investigaciones i
LEFT JOIN libretos_investigacion li ON i.id = li.investigacion_id
LEFT JOIN profiles resp ON i.responsable_id = resp.id
LEFT JOIN profiles impl ON i.implementador_id = impl.id
LEFT JOIN estado_reclutamiento_cat er ON i.estado_reclutamiento = er.id
WHERE i.estado_reclutamiento IS NOT NULL
ORDER BY i.creado_el DESC;

-- Verificar que la vista se creó correctamente
SELECT 'Vista creada exitosamente sin columna color' as mensaje;

-- Mostrar algunos datos de ejemplo
SELECT 
    id,
    investigacion_nombre,
    estado_reclutamiento_nombre,
    estado_reclutamiento_color,
    numero_participantes,
    participantes_actuales,
    progreso_reclutamiento,
    responsable_nombre,
    implementador_nombre
FROM vista_reclutamientos_completa
LIMIT 5; 