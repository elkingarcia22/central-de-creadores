-- ====================================
-- CREAR VISTA PRINCIPAL DE RECLUTAMIENTO
-- ====================================
-- Esta vista muestra investigaciones en estado "por_agendar" con su progreso real
-- NO muestra reclutamientos individuales, solo el progreso de cada investigación

-- Primero, eliminar la vista si existe
DROP VIEW IF EXISTS vista_reclutamientos;

-- Crear la vista principal de reclutamiento
CREATE VIEW vista_reclutamientos AS
SELECT 
    i.id,
    i.nombre as nombre_investigacion,
    i.estado as estado_investigacion,
    i.creado_el,
    i.actualizado_el,
    i.responsable_id,
    i.implementador_id,
    i.tipo_investigacion,
    i.periodo,
    i.fecha_inicio,
    i.fecha_fin,
    i.presupuesto,
    i.descripcion,
    i.objetivos,
    i.metodologia,
    i.criterios_seleccion,
    i.link_prueba,
    i.link_resultados,
    i.nivel_riesgo,
    i.estado_seguimiento,
    i.tipo_sesion,
    i.empresa_id,
    i.seguimiento_id,
    -- Progreso de participantes
    COALESCE(participantes_actuales.total_participantes, 0) as participantes_actuales,
    COALESCE(li.numero_participantes, 0) as participantes_requeridos,
    CASE 
        WHEN li.numero_participantes > 0 THEN 
            COALESCE(participantes_actuales.total_participantes, 0) || '/' || li.numero_participantes
        ELSE '0/0'
    END as progreso_participantes,
    -- Porcentaje de avance
    CASE 
        WHEN li.numero_participantes > 0 THEN 
            ROUND((COALESCE(participantes_actuales.total_participantes, 0)::numeric / li.numero_participantes::numeric) * 100, 1)
        ELSE 0
    END as porcentaje_avance
FROM investigaciones i
LEFT JOIN libretos_investigacion li ON i.id = li.investigacion_id
LEFT JOIN (
    -- Subconsulta para contar participantes únicos por investigación
    SELECT 
        r.investigacion_id,
        COUNT(DISTINCT r.participantes_id) as total_participantes
    FROM reclutamientos r
    GROUP BY r.investigacion_id
) participantes_actuales ON i.id = participantes_actuales.investigacion_id
WHERE i.estado = 'por_agendar'
ORDER BY i.creado_el DESC;

-- Verificar que la vista se creó correctamente
SELECT 
    'Vista creada exitosamente' as status,
    COUNT(*) as total_investigaciones
FROM vista_reclutamientos;

-- Mostrar los datos de la vista
SELECT 
    id,
    nombre_investigacion,
    estado_investigacion,
    participantes_actuales,
    participantes_requeridos,
    progreso_participantes,
    porcentaje_avance
FROM vista_reclutamientos; 