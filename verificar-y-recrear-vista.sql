-- ====================================
-- VERIFICAR Y RECREAR VISTA RECLUTAMIENTOS
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar si la vista existe
SELECT 
    '=== VERIFICAR SI LA VISTA EXISTE ===' as info;

SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE viewname = 'vista_reclutamientos_completa';

-- 2. Si no existe, crear la vista
DROP VIEW IF EXISTS vista_reclutamientos_completa;

CREATE VIEW vista_reclutamientos_completa AS
SELECT 
    i.id AS reclutamiento_id,
    i.id AS investigacion_id,
    i.libreto AS libreto_id,
    i.creado_el AS creado_en,
    i.actualizado_el AS actualizado_en,

    -- Nombre de la investigación (asegurar que se cargue)
    i.nombre AS titulo_investigacion,
    i.estado AS estado_investigacion,
    i.fecha_inicio AS fecha_inicio,
    i.fecha_fin AS fecha_fin,
    i.riesgo_automatico AS riesgo_automatico,

    -- Datos del libreto
    COALESCE(li.nombre_sesion, 'Sin libreto asignado') AS titulo_libreto,
    COALESCE(li.descripcion_general, 'Sin descripción') AS descripcion_libreto,
    COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0) AS participantes_requeridos,
    
    -- Datos del producto
    COALESCE(p.nombre, 'Sin producto') AS producto_nombre,
    
    -- Datos del tipo de investigación
    COALESCE(t.nombre, 'Sin tipo') AS tipo_investigacion_nombre,

    -- Datos de responsables
    COALESCE(resp.full_name, resp.nombre, 'Sin asignar') AS responsable_nombre,
    COALESCE(resp.email, 'Sin email') AS responsable_email,
    COALESCE(impl.full_name, impl.nombre, 'Sin asignar') AS implementador_nombre,
    COALESCE(impl.email, 'Sin email') AS implementador_email,

    -- Estado de reclutamiento
    COALESCE(er.nombre, 'Pendiente') AS estado_reclutamiento,
    COALESCE(er.color, '#6B7280') AS color_estado,
    COALESCE(er.orden, 1) AS orden_estado,

    -- Cálculos
    COALESCE(array_length(li.usuarios_participantes, 1), 0) AS participantes_actuales,
    
    -- Calcular progreso
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
    '✅ Vista vista_reclutamientos_completa creada exitosamente' as status;

-- 4. Probar la vista
SELECT 
    '=== PRUEBA DE LA VISTA ===' as info;

SELECT 
    reclutamiento_id,
    titulo_investigacion,
    estado_investigacion,
    responsable_nombre,
    implementador_nombre,
    participantes_requeridos,
    participantes_actuales,
    progreso_porcentaje
FROM vista_reclutamientos_completa
LIMIT 5; 