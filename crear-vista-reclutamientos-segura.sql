-- ====================================
-- CREAR VISTA RECLUTAMIENTOS (VERSIÓN SEGURA)
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar estructuras de todas las tablas involucradas
SELECT 
    '=== VERIFICACIÓN DE ESTRUCTURAS ===' as info;

-- Estructura de reclutamientos
SELECT 
    'Estructura de reclutamientos:' as info,
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'reclutamientos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Estructura de participantes
SELECT 
    'Estructura de participantes:' as info,
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'participantes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Estructura de investigaciones
SELECT 
    'Estructura de investigaciones:' as info,
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'investigaciones' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Estructura de estado_agendamiento_cat
SELECT 
    'Estructura de estado_agendamiento_cat:' as info,
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'estado_agendamiento_cat' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Crear la vista de reclutamientos completa (VERSIÓN SEGURA)
DROP VIEW IF EXISTS vista_reclutamientos_completa;

CREATE VIEW vista_reclutamientos_completa AS
SELECT 
    r.id,
    r.investigacion_id,
    r.participantes_id,
    r.fecha_asignado,
    r.fecha_sesion,
    r.reclutador_id,
    r.creado_por,
    r.estado_agendamiento,
    
    -- Datos de la investigación (usando solo columnas que sabemos que existen)
    i.nombre as investigacion_nombre,
    i.descripcion as investigacion_descripcion,
    i.estado as investigacion_estado,
    i.fecha_inicio as investigacion_fecha_inicio,
    i.fecha_fin as investigacion_fecha_fin,
    
    -- Datos del participante (usando solo columnas básicas)
    p.nombre as participante_nombre,
    p.email as participante_email,
    -- p.apellido as participante_apellido, -- Comentado hasta verificar si existe
    -- p.telefono as participante_telefono, -- Comentado hasta verificar si existe
    -- p.edad as participante_edad, -- Comentado hasta verificar si existe
    -- p.genero as participante_genero, -- Comentado hasta verificar si existe
    
    -- Datos del reclutador (desde usuarios_con_roles)
    ur.full_name as reclutador_nombre,
    ur.email as reclutador_email,
    ur.avatar_url as reclutador_avatar,
    ur.roles as reclutador_roles,
    
    -- Datos del creador (desde usuarios_con_roles)
    uc.full_name as creador_nombre,
    uc.email as creador_email,
    uc.avatar_url as creador_avatar,
    uc.roles as creador_roles,
    
    -- Datos del estado de agendamiento
    eac.nombre as estado_agendamiento_nombre,
    eac.descripcion as estado_agendamiento_descripcion,
    eac.color as estado_agendamiento_color,
    
    -- Verificar si la investigación tiene libreto
    CASE 
        WHEN li.id IS NOT NULL THEN true
        ELSE false
    END as tiene_libreto,
    
    -- Fechas formateadas
    r.fecha_asignado::date as fecha_asignado_date,
    r.fecha_sesion::date as fecha_sesion_date,
    
    -- Timestamps (usando fecha_asignado como referencia)
    r.fecha_asignado as created_at,
    r.fecha_asignado as updated_at
    
FROM reclutamientos r
LEFT JOIN investigaciones i ON r.investigacion_id = i.id
LEFT JOIN participantes p ON r.participantes_id = p.id
LEFT JOIN usuarios_con_roles ur ON r.reclutador_id = ur.id
LEFT JOIN usuarios_con_roles uc ON r.creado_por = uc.id
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
LEFT JOIN libretos_investigacion li ON i.id = li.investigacion_id;

-- 3. Verificar que la vista se creó correctamente
SELECT 
    '✅ Vista vista_reclutamientos_completa creada exitosamente' as status;

-- 4. Probar la vista
SELECT 
    id,
    investigacion_nombre,
    participante_nombre,
    estado_agendamiento_nombre,
    fecha_asignado_date
FROM vista_reclutamientos_completa 
ORDER BY fecha_asignado DESC
LIMIT 5;

-- 5. Verificar estructura de la vista creada
SELECT 
    'Estructura de la vista creada:' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'vista_reclutamientos_completa' 
AND table_schema = 'public'
ORDER BY ordinal_position; 