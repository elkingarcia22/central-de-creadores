-- ====================================
-- VISTA SIMPLE PARA RECLUTAMIENTO
-- ====================================
-- Ejecutar en el SQL Editor de Supabase DESPUÉS de ejecutar crear-estado-reclutamiento-solo.sql

-- 1. Crear vista simple para reclutamiento
DROP VIEW IF EXISTS vista_reclutamientos_completa;

CREATE VIEW vista_reclutamientos_completa AS
SELECT 
    -- Datos de investigación
    i.id as investigacion_id,
    i.nombre as investigacion_nombre,
    i.estado as investigacion_estado,
    i.fecha_inicio as investigacion_fecha_inicio,
    i.fecha_fin as investigacion_fecha_fin,
    i.riesgo_automatico as investigacion_riesgo,
    
    -- Datos del libreto (usando estructura existente)
    l.id as libreto_id,
    COALESCE(l.titulo, 'Libreto ' || i.libreto) as libreto_titulo,
    8 as libreto_numero_participantes, -- Valor por defecto
    COALESCE(l.descripcion, 'Descripción del libreto') as libreto_descripcion,
    
    -- Datos de responsables
    ur.nombre as responsable_nombre,
    ur.correo as responsable_correo,
    ur.activo as responsable_activo,
    
    ui.nombre as implementador_nombre,
    ui.correo as implementador_correo,
    ui.activo as implementador_activo,
    
    -- Estado de reclutamiento
    COALESCE(er.nombre, 'Pendiente') as estado_reclutamiento_nombre,
    COALESCE(er.color, '#6B7280') as estado_reclutamiento_color,
    COALESCE(er.activo, true) as estado_reclutamiento_activo,
    
    -- Conteo de participantes reclutados
    COALESCE(COUNT(r.id), 0) as participantes_reclutados,
    
    -- Progreso del reclutamiento (ej: 0/8, 3/8, etc.)
    COALESCE(COUNT(r.id), 0)::text || '/8' as progreso_reclutamiento,
    
    -- Porcentaje de completitud
    ROUND((COALESCE(COUNT(r.id), 0)::decimal / 8::decimal) * 100, 1) as porcentaje_completitud
    
FROM investigaciones i
LEFT JOIN libretos l ON i.libreto = l.id
LEFT JOIN usuarios ur ON i.responsable_id = ur.id
LEFT JOIN usuarios ui ON i.implementador_id = ui.id
LEFT JOIN estado_reclutamiento_cat er ON i.estado_reclutamiento = er.id
LEFT JOIN reclutamientos r ON i.id = r.investigacion_id

-- Solo investigaciones por agendar
WHERE i.estado = 'por_agendar'

GROUP BY 
    i.id, i.nombre, i.estado, i.fecha_inicio, i.fecha_fin, i.riesgo_automatico,
    l.id, l.titulo, l.descripcion,
    ur.nombre, ur.correo, ur.activo,
    ui.nombre, ui.correo, ui.activo,
    er.nombre, er.color, er.activo

ORDER BY i.fecha_inicio ASC;

-- 2. Verificar que la vista se creó correctamente
SELECT 'Vista simple creada exitosamente' as resultado;
SELECT COUNT(*) as total_investigaciones_por_agendar FROM vista_reclutamientos_completa;

-- 3. Mostrar estructura de la vista
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vista_reclutamientos_completa' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Ver datos de ejemplo
SELECT 
    investigacion_nombre,
    libreto_titulo,
    progreso_reclutamiento,
    porcentaje_completitud,
    responsable_nombre,
    implementador_nombre,
    estado_reclutamiento_nombre
FROM vista_reclutamientos_completa
LIMIT 5;

-- 5. Mostrar métricas resumidas
SELECT 
    COUNT(*) as total_investigaciones,
    SUM(libreto_numero_participantes) as total_participantes_necesarios,
    SUM(participantes_reclutados) as total_participantes_reclutados,
    ROUND(AVG(porcentaje_completitud), 1) as promedio_completitud
FROM vista_reclutamientos_completa; 