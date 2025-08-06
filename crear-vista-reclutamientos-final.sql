-- ====================================
-- CREAR VISTA RECLUTAMIENTOS FINAL
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Eliminar la vista si existe
DROP VIEW IF EXISTS vista_reclutamientos_completa;

-- 2. Crear la vista final corregida usando la estructura real
CREATE VIEW vista_reclutamientos_completa AS
SELECT 
    i.id AS reclutamiento_id,
    i.id AS investigacion_id,
    i.libreto AS libreto_id,
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

    -- Campos calculados para compatibilidad con el frontend
    0 AS participantes_actuales,
    'Pendiente' AS estado_reclutamiento,
    '#6B7280' AS color_estado,
    1 AS orden_estado,
    'Sin asignar' AS responsable_nombre,
    NULL AS responsable_email,
    'Sin asignar' AS implementador_nombre,
    NULL AS implementador_email,
    0 AS progreso_porcentaje,
    false AS reclutamiento_completo

FROM investigaciones i
LEFT JOIN libretos_investigacion li ON i.libreto::uuid = li.id
LEFT JOIN productos p ON i.producto_id = p.id
LEFT JOIN tipos_investigacion t ON i.tipo_investigacion_id = t.id
WHERE i.estado = 'por_agendar'
ORDER BY i.creado_el DESC;

-- 3. Verificar que la vista se creó correctamente
SELECT 
    '✅ Vista vista_reclutamientos_completa creada exitosamente' as status;

-- 4. Probar la vista
SELECT 
    reclutamiento_id,
    titulo_investigacion,
    titulo_libreto,
    participantes_requeridos,
    estado_reclutamiento
FROM vista_reclutamientos_completa 
ORDER BY creado_en DESC
LIMIT 5;

-- 5. Verificar estructura de la vista
SELECT 
    'Estructura de la vista:' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'vista_reclutamientos_completa' 
ORDER BY ordinal_position; 