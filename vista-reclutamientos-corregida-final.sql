-- ====================================
-- VISTA RECLUTAMIENTOS CORREGIDA FINAL
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Eliminar la vista si existe
DROP VIEW IF EXISTS vista_reclutamientos_completa;

-- 2. Crear vista corregida que filtre por estado y cargue nombres correctamente
CREATE VIEW vista_reclutamientos_completa AS
SELECT 
    i.id AS reclutamiento_id,
    i.id AS investigacion_id,
    i.libreto AS libreto_id,
    i.creado_el AS creado_en,
    i.actualizado_el AS actualizado_en,

    -- Datos básicos de la investigación
    i.nombre AS titulo_investigacion,
    i.estado AS estado_investigacion,
    i.fecha_inicio AS fecha_inicio,
    i.fecha_fin AS fecha_fin,
    i.riesgo_automatico AS riesgo_automatico,

    -- Datos básicos del libreto (solo si es UUID válido)
    CASE 
        WHEN i.libreto ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN li.nombre_sesion
        ELSE 'Sin libreto asignado'
    END AS titulo_libreto,
    
    CASE 
        WHEN i.libreto ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN li.descripcion_general
        ELSE 'Sin descripción'
    END AS descripcion_libreto,
    
    CASE 
        WHEN i.libreto ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0)
        ELSE 0
    END AS participantes_requeridos,
    
    -- Datos básicos del producto
    COALESCE(p.nombre, 'Sin producto') AS producto_nombre,
    
    -- Datos básicos del tipo de investigación
    COALESCE(t.nombre, 'Sin tipo') AS tipo_investigacion_nombre,

    -- Datos básicos de responsables (corregido)
    COALESCE(resp.full_name, resp.nombre, 'Sin asignar') AS responsable_nombre,
    COALESCE(resp.email, '') AS responsable_email,
    COALESCE(impl.full_name, impl.nombre, 'Sin asignar') AS implementador_nombre,
    COALESCE(impl.email, '') AS implementador_email,

    -- Estado básico
    COALESCE(er.nombre, 'Pendiente') AS estado_reclutamiento,
    COALESCE(er.color, '#6B7280') AS color_estado,
    COALESCE(er.orden, 1) AS orden_estado,

    -- Cálculos básicos
    CASE 
        WHEN i.libreto ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN COALESCE(array_length(li.usuarios_participantes, 1), 0)
        ELSE 0
    END AS participantes_actuales,
    
    -- Progreso básico
    CASE 
        WHEN i.libreto ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
             AND COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0) > 0 THEN 
            ROUND((COALESCE(array_length(li.usuarios_participantes, 1), 0)::decimal / 
                   COALESCE(li.numero_participantes, li.numero_participantes_esperados, 0)::decimal) * 100, 1)
        ELSE 0 
    END AS progreso_porcentaje,
    
    -- Completitud básica
    CASE 
        WHEN i.libreto ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
             AND COALESCE(array_length(li.usuarios_participantes, 1), 0) >= 
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
-- FILTRAR SOLO INVESTIGACIONES POR AGENDAR
WHERE i.estado = 'por_agendar'
ORDER BY i.creado_el DESC;

-- 3. Verificar que la vista funciona
SELECT 
    '✅ Vista corregida creada - Solo investigaciones por agendar' as status;

-- 4. Probar la vista
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

-- 5. Verificar cuántas investigaciones por agendar hay
SELECT 
    '=== INVESTIGACIONES POR AGENDAR ===' as info,
    COUNT(*) as total_por_agendar
FROM investigaciones 
WHERE estado = 'por_agendar';

-- 6. Verificar estructura de profiles
SELECT 
    '=== ESTRUCTURA PROFILES ===' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position; 