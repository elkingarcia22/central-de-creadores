-- ====================================
-- ACTUALIZAR VISTA RECLUTAMIENTOS COMPLETA (VERSIÓN CORREGIDA)
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Eliminar la vista actual
DROP VIEW IF EXISTS vista_reclutamientos_completa;

-- 2. Crear la nueva vista corregida
CREATE VIEW vista_reclutamientos_completa AS
SELECT 
    r.id AS reclutamiento_id,
    r.investigacion_id,
    r.participantes_id,
    r.fecha_asignado,
    r.fecha_sesion,
    r.reclutador_id,
    r.creado_por,
    r.estado_agendamiento,
    
    -- Datos de la investigación
    i.nombre AS investigacion_nombre,
    i.estado AS estado_investigacion,
    i.fecha_inicio AS investigacion_fecha_inicio,
    i.fecha_fin AS investigacion_fecha_fin,
    i.riesgo_automatico AS investigacion_riesgo,
    
    -- Datos del libreto
    li.nombre_sesion AS libreto_titulo,
    li.descripcion_general AS libreto_descripcion,
    COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0) AS libreto_numero_participantes,
    
    -- Datos del producto
    p.nombre AS producto_nombre,
    
    -- Datos del tipo de investigación
    t.nombre AS tipo_investigacion_nombre,
    
    -- Datos de responsables
    resp.full_name AS responsable_nombre,
    resp.email AS responsable_correo,
    impl.full_name AS implementador_nombre,
    impl.email AS implementador_correo,
    
    -- Estado de reclutamiento
    COALESCE(er.nombre, 'Pendiente') AS estado_reclutamiento_nombre,
    COALESCE(er.color, '#6B7280') AS estado_reclutamiento_color,
    COALESCE(er.orden, 1) AS orden_estado,
    
    -- Datos del participante (si existe) - usando columnas que sabemos que existen
    part.nombre AS participante_nombre,
    -- part.email AS participante_email, -- Comentado hasta verificar la estructura
    
    -- Cálculos de progreso
    CASE 
        WHEN r.participantes_id IS NOT NULL THEN 1
        ELSE 0
    END AS participantes_reclutados,
    
    CASE 
        WHEN r.participantes_id IS NOT NULL AND COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0) > 0 THEN
            CONCAT('1/', COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0))
        ELSE '0/0'
    END AS progreso_reclutamiento,
    
    CASE 
        WHEN r.participantes_id IS NOT NULL AND COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0) > 0 THEN
            ROUND((1.0 / COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0)) * 100, 1)
        ELSE 0
    END AS porcentaje_completitud

FROM reclutamientos r
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
LEFT JOIN libretos_investigacion li ON i.libreto::uuid = li.id
LEFT JOIN productos p ON i.producto_id = p.id
LEFT JOIN tipos_investigacion t ON i.tipo_investigacion_id = t.id
LEFT JOIN profiles resp ON i.responsable_id = resp.id
LEFT JOIN profiles impl ON i.implementador_id = impl.id
LEFT JOIN estado_reclutamiento_cat er ON r.estado_agendamiento = er.id
LEFT JOIN participantes part ON r.participantes_id = part.id
ORDER BY r.fecha_asignado DESC;

-- 3. Verificar que la vista se creó correctamente
SELECT 
    '✅ Vista vista_reclutamientos_completa actualizada exitosamente' as status;

-- 4. Probar la vista con datos reales
SELECT 
    reclutamiento_id,
    investigacion_nombre,
    estado_reclutamiento_nombre,
    participante_nombre,
    progreso_reclutamiento,
    porcentaje_completitud,
    fecha_asignado
FROM vista_reclutamientos_completa 
ORDER BY fecha_asignado DESC
LIMIT 10; 