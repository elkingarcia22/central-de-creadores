-- ====================================
-- CREAR VISTA RECLUTAMIENTOS CON DATOS REALES
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Eliminar la vista si existe
DROP VIEW IF EXISTS vista_reclutamientos_completa;

-- 2. Crear la vista con datos reales
CREATE VIEW vista_reclutamientos_completa AS
SELECT 
    i.id AS reclutamiento_id,
    i.id AS investigacion_id,
    i.libreto AS libreto_id,
    i.creado_el AS creado_en,
    i.actualizado_el AS actualizado_en,

    -- Datos reales de la investigación
    i.nombre AS titulo_investigacion,
    i.estado AS estado_investigacion,
    i.fecha_inicio AS fecha_inicio,
    i.fecha_fin AS fecha_fin,
    i.riesgo_automatico AS riesgo_automatico,

    -- Datos reales del libreto
    li.nombre_sesion AS titulo_libreto,
    li.descripcion_general AS descripcion_libreto,
    COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0) AS participantes_requeridos,
    
    -- Datos reales del producto
    p.nombre AS producto_nombre,
    
    -- Datos reales del tipo de investigación
    t.nombre AS tipo_investigacion_nombre,

    -- Datos reales de responsables
    resp.full_name AS responsable_nombre,
    resp.email AS responsable_email,
    impl.full_name AS implementador_nombre,
    impl.email AS implementador_email,

    -- Estado de reclutamiento real
    COALESCE(er.nombre, 'Pendiente') AS estado_reclutamiento,
    COALESCE(er.color, '#6B7280') AS color_estado,
    COALESCE(er.orden, 1) AS orden_estado,

    -- Cálculos reales
    COALESCE(array_length(li.usuarios_participantes, 1), 0) AS participantes_actuales,
    
    -- Calcular progreso real
    CASE 
        WHEN COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0) > 0 THEN 
            ROUND((COALESCE(array_length(li.usuarios_participantes, 1), 0)::decimal / 
                   COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0)::decimal) * 100, 1)
        ELSE 0 
    END AS progreso_porcentaje,
    
    -- Determinar si está completo
    CASE 
        WHEN COALESCE(array_length(li.usuarios_participantes, 1), 0) >= 
             COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0) THEN true
        ELSE false 
    END AS reclutamiento_completo

FROM investigaciones i
LEFT JOIN libretos_investigacion li ON i.libreto::uuid = li.id
LEFT JOIN productos p ON i.producto_id = p.id
LEFT JOIN tipos_investigacion t ON i.tipo_investigacion_id = t.id
LEFT JOIN profiles resp ON i.responsable_id = resp.id
LEFT JOIN profiles impl ON i.implementador_id = impl.id
LEFT JOIN estado_reclutamiento_cat er ON i.estado_reclutamiento = er.id
WHERE i.estado = 'por_agendar'
ORDER BY i.creado_el DESC;

-- 3. Verificar que la vista se creó correctamente
SELECT 
    '✅ Vista vista_reclutamientos_completa creada con datos reales' as status;

-- 4. Probar la vista con datos reales
SELECT 
    reclutamiento_id,
    titulo_investigacion,
    titulo_libreto,
    participantes_requeridos,
    participantes_actuales,
    progreso_porcentaje,
    responsable_nombre,
    implementador_nombre,
    estado_reclutamiento
FROM vista_reclutamientos_completa 
ORDER BY creado_en DESC
LIMIT 10;

-- 5. Verificar estructura de la vista
SELECT 
    'Estructura de la vista:' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'vista_reclutamientos_completa' 
ORDER BY ordinal_position; 