-- ====================================
-- VISTA ACTUALIZADA PARA MÓDULO RECLUTAMIENTO
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Crear vista actualizada para reclutamiento
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
    
    -- Datos del libreto
    l.id as libreto_id,
    l.titulo as libreto_titulo,
    l.numero_participantes as libreto_numero_participantes,
    l.descripcion as libreto_descripcion,
    
    -- Datos de responsables
    ur.nombre as responsable_nombre,
    ur.correo as responsable_correo,
    ur.activo as responsable_activo,
    
    ui.nombre as implementador_nombre,
    ui.correo as implementador_correo,
    ui.activo as implementador_activo,
    
    -- Estado de reclutamiento
    er.nombre as estado_reclutamiento_nombre,
    er.color as estado_reclutamiento_color,
    er.activo as estado_reclutamiento_activo,
    
    -- Conteo de participantes reclutados
    COALESCE(COUNT(r.id), 0) as participantes_reclutados,
    
    -- Progreso del reclutamiento (ej: 0/8, 3/8, etc.)
    CASE 
        WHEN l.numero_participantes IS NULL THEN '0/0'
        ELSE COALESCE(COUNT(r.id), 0)::text || '/' || l.numero_participantes::text
    END as progreso_reclutamiento,
    
    -- Porcentaje de completitud
    CASE 
        WHEN l.numero_participantes IS NULL OR l.numero_participantes = 0 THEN 0
        ELSE ROUND((COALESCE(COUNT(r.id), 0)::decimal / l.numero_participantes::decimal) * 100, 1)
    END as porcentaje_completitud
    
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
    l.id, l.titulo, l.numero_participantes, l.descripcion,
    ur.nombre, ur.correo, ur.activo,
    ui.nombre, ui.correo, ui.activo,
    er.nombre, er.color, er.activo

ORDER BY i.fecha_inicio ASC;

-- 2. Verificar que la vista se creó correctamente
SELECT 'Vista actualizada creada exitosamente' as resultado;
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