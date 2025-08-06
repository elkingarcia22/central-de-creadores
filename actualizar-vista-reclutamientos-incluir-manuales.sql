-- ====================================
-- ACTUALIZAR VISTA RECLUTAMIENTOS - INCLUIR MANUALES
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Eliminar la vista actual
DROP VIEW IF EXISTS vista_reclutamientos_completa;

-- 2. Crear la nueva vista que incluya tanto investigaciones por agendar como reclutamientos manuales
CREATE VIEW vista_reclutamientos_completa AS
WITH reclutamientos_manuales AS (
    -- Reclutamientos creados manualmente desde la tabla reclutamientos
    SELECT 
        r.id::text AS reclutamiento_id,
        r.investigacion_id::text AS investigacion_id,
        r.participantes_id::text AS participantes_id,
        r.fecha_asignado AS creado_en,
        r.fecha_asignado AS actualizado_en,
        
        -- Datos de la investigación
        i.nombre AS titulo_investigacion,
        i.estado AS estado_investigacion,
        i.fecha_inicio,
        i.fecha_fin,
        i.riesgo_automatico,
        
        -- Datos del libreto
        li.nombre_sesion AS titulo_libreto,
        li.descripcion_general AS descripcion_libreto,
        COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0) AS participantes_requeridos,
        
        -- Datos del producto
        p.nombre AS producto_nombre,
        
        -- Datos del tipo de investigación
        t.nombre AS tipo_investigacion_nombre,
        
        -- Datos del participante
        part.nombre AS participante_nombre,
        
        -- Datos del reclutador
        resp.full_name AS responsable_nombre,
        resp.email AS responsable_email,
        impl.full_name AS implementador_nombre,
        impl.email AS implementador_email,
        
        -- Estado de reclutamiento
        COALESCE(er.nombre, 'Pendiente') AS estado_reclutamiento,
        COALESCE(er.color, '#6B7280') AS color_estado,
        COALESCE(er.orden, 1) AS orden_estado,
        
        -- Cálculos
        CASE 
            WHEN li.usuarios_participantes IS NOT NULL THEN array_length(li.usuarios_participantes, 1)
            ELSE 0
        END AS participantes_actuales,
        
        CASE 
            WHEN COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0) > 0 THEN 
                ROUND((CASE 
                    WHEN li.usuarios_participantes IS NOT NULL THEN array_length(li.usuarios_participantes, 1)
                    ELSE 0
                END::decimal / COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0)::decimal) * 100, 1)
            ELSE 0 
        END AS progreso_porcentaje,
        
        CASE 
            WHEN li.usuarios_participantes IS NOT NULL AND 
                 array_length(li.usuarios_participantes, 1) >= COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0) THEN true
            ELSE false 
        END AS reclutamiento_completo,
        
        'manual' AS tipo_reclutamiento
        
    FROM reclutamientos r
    LEFT JOIN investigaciones i ON r.investigacion_id = i.id
    LEFT JOIN libretos_investigacion li ON i.libreto::uuid = li.id
    LEFT JOIN productos p ON i.producto_id = p.id
    LEFT JOIN tipos_investigacion t ON i.tipo_investigacion_id = t.id
    LEFT JOIN participantes part ON r.participantes_id = part.id
    LEFT JOIN profiles resp ON i.responsable_id = resp.id
    LEFT JOIN profiles impl ON i.implementador_id = impl.id
    LEFT JOIN estado_reclutamiento_cat er ON i.estado_reclutamiento = er.id
),
investigaciones_por_agendar AS (
    -- Investigaciones en estado por_agendar que NO tienen reclutamiento manual
    SELECT 
        i.id::text AS reclutamiento_id,
        i.id::text AS investigacion_id,
        NULL::text AS participantes_id,
        i.creado_el AS creado_en,
        i.actualizado_el AS actualizado_en,
        
        -- Datos de la investigación
        i.nombre AS titulo_investigacion,
        i.estado AS estado_investigacion,
        i.fecha_inicio,
        i.fecha_fin,
        i.riesgo_automatico,
        
        -- Datos del libreto
        li.nombre_sesion AS titulo_libreto,
        li.descripcion_general AS descripcion_libreto,
        COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0) AS participantes_requeridos,
        
        -- Datos del producto
        p.nombre AS producto_nombre,
        
        -- Datos del tipo de investigación
        t.nombre AS tipo_investigacion_nombre,
        
        -- Datos del participante (NULL para investigaciones por agendar)
        NULL AS participante_nombre,
        
        -- Datos del reclutador
        resp.full_name AS responsable_nombre,
        resp.email AS responsable_email,
        impl.full_name AS implementador_nombre,
        impl.email AS implementador_email,
        
        -- Estado de reclutamiento
        COALESCE(er.nombre, 'Pendiente') AS estado_reclutamiento,
        COALESCE(er.color, '#6B7280') AS color_estado,
        COALESCE(er.orden, 1) AS orden_estado,
        
        -- Cálculos
        CASE 
            WHEN li.usuarios_participantes IS NOT NULL THEN array_length(li.usuarios_participantes, 1)
            ELSE 0
        END AS participantes_actuales,
        
        CASE 
            WHEN COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0) > 0 THEN 
                ROUND((CASE 
                    WHEN li.usuarios_participantes IS NOT NULL THEN array_length(li.usuarios_participantes, 1)
                    ELSE 0
                END::decimal / COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0)::decimal) * 100, 1)
            ELSE 0 
        END AS progreso_porcentaje,
        
        CASE 
            WHEN li.usuarios_participantes IS NOT NULL AND 
                 array_length(li.usuarios_participantes, 1) >= COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0) THEN true
            ELSE false 
        END AS reclutamiento_completo,
        
        'automatico' AS tipo_reclutamiento
        
    FROM investigaciones i
    LEFT JOIN libretos_investigacion li ON i.libreto::uuid = li.id
    LEFT JOIN productos p ON i.producto_id = p.id
    LEFT JOIN tipos_investigacion t ON i.tipo_investigacion_id = t.id
    LEFT JOIN profiles resp ON i.responsable_id = resp.id
    LEFT JOIN profiles impl ON i.implementador_id = impl.id
    LEFT JOIN estado_reclutamiento_cat er ON i.estado_reclutamiento = er.id
    WHERE i.estado = 'por_agendar'
    AND NOT EXISTS (
        SELECT 1 FROM reclutamientos r WHERE r.investigacion_id = i.id
    )
)
SELECT * FROM reclutamientos_manuales
UNION ALL
SELECT * FROM investigaciones_por_agendar
ORDER BY creado_en DESC;

-- 3. Verificar que la vista se creó correctamente
SELECT 
    '✅ Vista vista_reclutamientos_completa actualizada exitosamente' as status;

-- 4. Probar la vista
SELECT 
    '=== PRUEBA DE LA VISTA ===' as info;

SELECT 
    reclutamiento_id,
    titulo_investigacion,
    tipo_reclutamiento,
    estado_reclutamiento,
    participantes_requeridos,
    participantes_actuales,
    progreso_porcentaje,
    responsable_nombre
FROM vista_reclutamientos_completa 
ORDER BY creado_en DESC
LIMIT 10;

-- 5. Verificar cuántos reclutamientos manuales hay
SELECT 
    '=== RECLUTAMIENTOS MANUALES ===' as info,
    COUNT(*) as total_manuales
FROM reclutamientos;

-- 6. Verificar cuántas investigaciones por agendar hay
SELECT 
    '=== INVESTIGACIONES POR AGENDAR ===' as info,
    COUNT(*) as total_por_agendar
FROM investigaciones 
WHERE estado = 'por_agendar';

-- 7. Verificar total en la vista
SELECT 
    '=== TOTAL EN VISTA ===' as info,
    COUNT(*) as total_en_vista
FROM vista_reclutamientos_completa; 