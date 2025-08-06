-- ====================================
-- ACTUALIZAR VISTA RECLUTAMIENTOS - COMPATIBLE CON FRONTEND
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Eliminar la vista actual
DROP VIEW IF EXISTS vista_reclutamientos_completa;

-- 2. Crear la nueva vista con nombres de campos compatibles con el frontend
CREATE VIEW vista_reclutamientos_completa AS
SELECT 
    -- Campos de identificación
    COALESCE(r.id::text, i.id::text) AS reclutamiento_id,
    COALESCE(r.investigacion_id::text, i.id::text) AS investigacion_id,
    r.participantes_id::text AS participantes_id,
    
    -- Fechas
    COALESCE(r.fecha_asignado, i.creado_el) AS creado_en,
    COALESCE(r.fecha_asignado, i.actualizado_el) AS actualizado_en,
    
    -- Datos de la investigación (nombres compatibles con frontend)
    i.nombre AS investigacion_nombre,
    i.estado AS estado_investigacion,
    i.fecha_inicio AS investigacion_fecha_inicio,
    i.fecha_fin AS investigacion_fecha_fin,
    i.riesgo_automatico AS investigacion_riesgo,
    
    -- Datos del libreto (nombres compatibles con frontend)
    li.nombre_sesion AS libreto_titulo,
    li.descripcion_general AS libreto_descripcion,
    COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0) AS libreto_numero_participantes,
    
    -- Datos del producto
    p.nombre AS producto_nombre,
    
    -- Datos del tipo de investigación
    t.nombre AS tipo_investigacion_nombre,
    
    -- Datos del participante
    part.nombre AS participante_nombre,
    
    -- Datos del reclutador (nombres compatibles con frontend)
    resp.full_name AS responsable_nombre,
    resp.email AS responsable_correo,
    impl.full_name AS implementador_nombre,
    impl.email AS implementador_correo,
    
    -- Estado de reclutamiento (nombres compatibles con frontend)
    COALESCE(er.nombre, 'Pendiente') AS estado_reclutamiento_nombre,
    COALESCE(er.color, '#6B7280') AS estado_reclutamiento_color,
    COALESCE(er.orden, 1) AS orden_estado,
    COALESCE(er.id::text, '1') AS estado_reclutamiento_id,
    
    -- Cálculos (nombres compatibles con frontend)
    CASE 
        WHEN li.usuarios_participantes IS NOT NULL THEN array_length(li.usuarios_participantes, 1)
        ELSE 0
    END AS participantes_reclutados,
    
    CASE 
        WHEN COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0) > 0 THEN 
            ROUND((CASE 
                WHEN li.usuarios_participantes IS NOT NULL THEN array_length(li.usuarios_participantes, 1)
                ELSE 0
            END::decimal / COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0)::decimal) * 100, 1)
        ELSE 0 
    END AS porcentaje_completitud,
    
    CASE 
        WHEN COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0) > 0 THEN 
            CONCAT(
                CASE 
                    WHEN li.usuarios_participantes IS NOT NULL THEN array_length(li.usuarios_participantes, 1)
                    ELSE 0
                END::text,
                '/',
                COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0)::text
            )
        ELSE '0/0'
    END AS progreso_reclutamiento,
    
    CASE 
        WHEN li.usuarios_participantes IS NOT NULL AND 
             array_length(li.usuarios_participantes, 1) >= COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0) THEN true
        ELSE false 
    END AS reclutamiento_completo,
    
    -- Tipo de reclutamiento
    CASE 
        WHEN r.id IS NOT NULL THEN 'manual'
        ELSE 'automatico'
    END AS tipo_reclutamiento,
    
    -- Cálculo de riesgo de reclutamiento
    CASE 
        WHEN i.fecha_inicio IS NULL THEN 'sin_fecha'
        WHEN i.fecha_inicio::date - CURRENT_DATE < 7 THEN 'alto'
        WHEN i.fecha_inicio::date - CURRENT_DATE < 14 THEN 'medio'
        ELSE 'bajo'
    END AS riesgo_reclutamiento,
    
    -- Color del riesgo
    CASE 
        WHEN i.fecha_inicio IS NULL THEN '#6B7280'
        WHEN i.fecha_inicio::date - CURRENT_DATE < 7 THEN '#EF4444'
        WHEN i.fecha_inicio::date - CURRENT_DATE < 14 THEN '#F59E0B'
        ELSE '#10B981'
    END AS riesgo_reclutamiento_color,
    
    -- Días restantes hasta el inicio
    CASE 
        WHEN i.fecha_inicio IS NULL THEN NULL
        ELSE i.fecha_inicio::date - CURRENT_DATE
    END AS dias_restantes_inicio
    
FROM investigaciones i
LEFT JOIN reclutamientos r ON i.id = r.investigacion_id
LEFT JOIN libretos_investigacion li ON i.libreto::uuid = li.id
LEFT JOIN productos p ON i.producto_id = p.id
LEFT JOIN tipos_investigacion t ON i.tipo_investigacion_id = t.id
LEFT JOIN participantes part ON r.participantes_id = part.id
LEFT JOIN profiles resp ON i.responsable_id = resp.id
LEFT JOIN profiles impl ON i.implementador_id = impl.id
LEFT JOIN estado_reclutamiento_cat er ON i.estado_reclutamiento = er.id
WHERE i.estado = 'por_agendar' OR r.id IS NOT NULL
ORDER BY creado_en DESC;

-- 3. Verificar que la vista se creó correctamente
SELECT 
    '✅ Vista vista_reclutamientos_completa actualizada exitosamente' as status;

-- 4. Probar la vista
SELECT 
    '=== PRUEBA DE LA VISTA ===' as info;

SELECT 
    reclutamiento_id,
    investigacion_nombre,
    tipo_reclutamiento,
    estado_reclutamiento_nombre,
    libreto_numero_participantes,
    participantes_reclutados,
    progreso_reclutamiento,
    responsable_nombre
FROM vista_reclutamientos_completa 
ORDER BY creado_en DESC
LIMIT 10;

-- 5. Verificar total en la vista
SELECT 
    '=== TOTAL EN VISTA ===' as info,
    COUNT(*) as total_en_vista
FROM vista_reclutamientos_completa; 