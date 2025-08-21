-- ====================================
-- CORREGIR VISTA PARA CÁLCULO CORRECTO DE PARTICIPANTES (VERSIÓN FIXED)
-- ====================================

-- 1. Eliminar la vista actual
DROP VIEW IF EXISTS vista_reclutamientos_completa;

-- 2. Crear la vista corregida usando estructura conocida
CREATE VIEW vista_reclutamientos_completa AS
SELECT 
    i.id AS reclutamiento_id,
    i.id AS investigacion_id,
    i.creado_el AS creado_en,
    i.actualizado_el AS actualizado_en,
    
    -- Datos de la investigación
    i.nombre AS titulo_investigacion,
    i.estado AS estado_investigacion,
    i.fecha_inicio AS fecha_inicio,
    i.fecha_fin AS fecha_fin,
    i.riesgo_automatico AS riesgo_automatico,
    
    -- Datos del libreto
    li.nombre_sesion AS titulo_libreto,
    li.descripcion_general AS descripcion_libreto,
    COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0) AS participantes_requeridos,
    
    -- Datos del producto
    p.nombre AS producto_nombre,
    
    -- Datos del tipo de investigación
    t.nombre AS tipo_investigacion_nombre,
    
    -- Datos de responsables
    resp.full_name AS responsable_nombre,
    resp.email AS responsable_email,
    impl.full_name AS implementador_nombre,
    impl.email AS implementador_email,
    
    -- Estado de reclutamiento
    COALESCE(er.nombre, 'Pendiente') AS estado_reclutamiento,
    COALESCE(er.color, '#6B7280') AS color_estado,
    COALESCE(er.orden, 1) AS orden_estado,
    
    -- Cálculo CORREGIDO de participantes actuales (usando nombre que sabemos que existe)
    COALESCE(participantes_count.total_participantes, 0) AS participantes_actuales,
    
    -- Progreso del reclutamiento
    CASE 
        WHEN COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0) > 0 THEN 
            CONCAT(COALESCE(participantes_count.total_participantes, 0), '/', COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0))
        ELSE 
            CONCAT(COALESCE(participantes_count.total_participantes, 0), '/0')
    END AS progreso_reclutamiento,
    
    -- Porcentaje de completitud
    CASE 
        WHEN COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0) > 0 THEN 
            ROUND((COALESCE(participantes_count.total_participantes, 0)::decimal / COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0)::decimal) * 100, 1)
        ELSE 0 
    END AS progreso_porcentaje,
    
    -- Determinar si está completo
    CASE 
        WHEN COALESCE(participantes_count.total_participantes, 0) >= COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0) 
        AND COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0) > 0 THEN true
        ELSE false 
    END AS reclutamiento_completo,
    
    -- Tipo de reclutamiento
    'automatico' AS tipo_reclutamiento,
    
    -- Campos adicionales para compatibilidad
    true AS tiene_libreto,
    COALESCE(participantes_count.total_participantes, 0) > 0 AS tiene_participantes,
    
    -- IDs para compatibilidad
    resp.id AS responsable_id,
    impl.id AS implementador_id,
    er.id AS estado_reclutamiento_id

FROM investigaciones i
LEFT JOIN libretos_investigacion li ON i.id = li.investigacion_id
LEFT JOIN productos p ON i.producto_id = p.id
LEFT JOIN tipos_investigacion t ON i.tipo_investigacion_id = t.id
LEFT JOIN profiles resp ON i.responsable_id = resp.id
LEFT JOIN profiles impl ON i.implementador_id = impl.id
LEFT JOIN estado_reclutamiento_cat er ON i.estado_reclutamiento = er.id
LEFT JOIN (
    -- Subconsulta para contar participantes únicos por investigación
    SELECT 
        r.investigacion_id,
        COUNT(DISTINCT r.participantes_id) as total_participantes
    FROM reclutamientos r
    WHERE r.participantes_id IS NOT NULL
    GROUP BY r.investigacion_id
) participantes_count ON i.id = participantes_count.investigacion_id
WHERE i.estado_reclutamiento IS NOT NULL
ORDER BY i.creado_el DESC;

-- 3. Verificar que la vista se creó correctamente
SELECT 'Vista corregida creada exitosamente' as mensaje;

-- 4. Verificar datos de ejemplo
SELECT 
    investigacion_id,
    titulo_investigacion,
    participantes_requeridos,
    participantes_actuales,
    progreso_reclutamiento,
    progreso_porcentaje
FROM vista_reclutamientos_completa
LIMIT 5;
