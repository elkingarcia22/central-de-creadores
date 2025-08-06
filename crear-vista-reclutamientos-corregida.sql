-- ====================================
-- CREAR VISTA RECLUTAMIENTOS CORREGIDA
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Eliminar la vista si existe
DROP VIEW IF EXISTS vista_reclutamientos_completa;

-- 2. Crear vista corregida que use los datos correctos del libreto
CREATE VIEW vista_reclutamientos_completa AS
SELECT 
    i.id AS reclutamiento_id,
    i.id AS investigacion_id,
    i.libreto AS libreto_id,
    i.creado_el AS creado_en,
    i.actualizado_el AS actualizado_en,

    -- Datos de la investigación
    i.nombre AS investigacion_nombre,
    i.estado AS estado_investigacion,
    i.fecha_inicio AS investigacion_fecha_inicio,
    i.fecha_fin AS investigacion_fecha_fin,
    i.riesgo_automatico AS investigacion_riesgo,

    -- Datos del libreto (usando estructura real)
    COALESCE(li.nombre_sesion, 'Sin libreto asignado') AS libreto_titulo,
    COALESCE(li.descripcion_general, 'Sin descripción') AS libreto_descripcion,
    COALESCE(li.numero_participantes, 0) AS libreto_numero_participantes,
    
    -- Datos del producto
    COALESCE(p.nombre, 'Sin producto') AS producto_nombre,
    
    -- Datos del tipo de investigación
    COALESCE(t.nombre, 'Sin tipo') AS tipo_investigacion_nombre,

    -- Datos de responsables
    COALESCE(resp.full_name, 'Sin asignar') AS responsable_nombre,
    COALESCE(resp.email, 'Sin email') AS responsable_correo,
    COALESCE(impl.full_name, 'Sin asignar') AS implementador_nombre,
    COALESCE(impl.email, 'Sin email') AS implementador_correo,

    -- Estado de reclutamiento
    COALESCE(er.nombre, 'Pendiente') AS estado_reclutamiento_nombre,
    COALESCE(er.color, '#6B7280') AS estado_reclutamiento_color,
    COALESCE(er.orden, 1) AS orden_estado,

    -- Cálculos de progreso usando datos del libreto
    COALESCE(array_length(li.usuarios_participantes, 1), 0) AS participantes_reclutados,
    
    -- Progreso en formato "0/8" usando numero_participantes del libreto
    CASE 
        WHEN li.numero_participantes IS NULL OR li.numero_participantes = 0 THEN '0/0'
        ELSE COALESCE(array_length(li.usuarios_participantes, 1), 0)::text || '/' || li.numero_participantes::text
    END AS progreso_reclutamiento,
    
    -- Porcentaje de completitud
    CASE 
        WHEN li.numero_participantes IS NULL OR li.numero_participantes = 0 THEN 0
        ELSE ROUND((COALESCE(array_length(li.usuarios_participantes, 1), 0)::decimal / li.numero_participantes::decimal) * 100, 1)
    END AS porcentaje_completitud,
    
    -- Determinar si está completo
    CASE 
        WHEN li.numero_participantes IS NULL OR li.numero_participantes = 0 THEN false
        WHEN COALESCE(array_length(li.usuarios_participantes, 1), 0) >= li.numero_participantes THEN true
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
SELECT '✅ Vista vista_reclutamientos_completa creada exitosamente' as status;

-- 4. Probar la vista con algunos datos
SELECT 
    investigacion_nombre,
    libreto_titulo,
    libreto_numero_participantes,
    participantes_reclutados,
    progreso_reclutamiento,
    porcentaje_completitud,
    reclutamiento_completo
FROM vista_reclutamientos_completa 
LIMIT 5; 