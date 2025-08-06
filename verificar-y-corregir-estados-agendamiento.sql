-- ====================================
-- VERIFICAR Y CORREGIR ESTADOS DE AGENDAMIENTO
-- ====================================
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar estructura actual de estado_agendamiento_cat
SELECT '=== VERIFICANDO ESTRUCTURA ACTUAL ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'estado_agendamiento_cat'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar datos existentes en estado_agendamiento_cat
SELECT '=== DATOS EXISTENTES EN ESTADO_AGENDAMIENTO_CAT ===' as info;
SELECT 
    id,
    nombre,
    activo
FROM estado_agendamiento_cat
ORDER BY nombre;

-- 3. Crear estados faltantes si no existen
INSERT INTO estado_agendamiento_cat (nombre, activo) VALUES
    ('Pendiente de agendamiento', true),
    ('Pendiente', true),
    ('En progreso', true),
    ('Finalizado', true),
    ('Cancelado', true)
ON CONFLICT (nombre) DO NOTHING;

-- 4. Verificar que todos los estados necesarios existen
SELECT '=== ESTADOS DESPUÉS DE INSERCIÓN ===' as info;
SELECT 
    id,
    nombre,
    activo
FROM estado_agendamiento_cat
ORDER BY nombre;

-- 5. Verificar estructura de la tabla reclutamientos
SELECT '=== VERIFICANDO ESTRUCTURA DE RECLUTAMIENTOS ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'reclutamientos'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Verificar algunos reclutamientos existentes con sus estados
SELECT '=== RECLUTAMIENTOS CON ESTADOS ACTUALES ===' as info;
SELECT 
    r.id,
    r.investigacion_id,
    r.fecha_sesion,
    r.duracion_sesion,
    r.estado_agendamiento,
    eac.nombre as estado_nombre,
    eac.activo as estado_activo,
    CASE 
        WHEN r.fecha_sesion IS NULL THEN 'Pendiente de agendamiento'
        WHEN NOW() AT TIME ZONE 'America/Bogota' < r.fecha_sesion AT TIME ZONE 'America/Bogota' THEN 'Pendiente'
        WHEN NOW() AT TIME ZONE 'America/Bogota' >= r.fecha_sesion AT TIME ZONE 'America/Bogota' 
             AND NOW() AT TIME ZONE 'America/Bogota' <= (r.fecha_sesion + (COALESCE(r.duracion_sesion, 60) || ' minutes')::INTERVAL) AT TIME ZONE 'America/Bogota' THEN 'En progreso'
        ELSE 'Finalizado'
    END as estado_calculado
FROM reclutamientos r
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
ORDER BY r.fecha_sesion DESC
LIMIT 10;

-- 7. Verificar tipos de participantes
SELECT '=== VERIFICANDO TIPOS DE PARTICIPANTES ===' as info;
SELECT 
    'Externos' as tipo,
    COUNT(*) as cantidad
FROM participantes
UNION ALL
SELECT 
    'Internos' as tipo,
    COUNT(*) as cantidad
FROM participantes_internos
UNION ALL
SELECT 
    'Friend and Family' as tipo,
    COUNT(*) as cantidad
FROM participantes_friend_family;

-- 8. Verificar reclutamientos con diferentes tipos de participantes
SELECT '=== RECLUTAMIENTOS CON TIPOS DE PARTICIPANTES ===' as info;
SELECT 
    r.id,
    r.investigacion_id,
    CASE 
        WHEN r.participantes_id IS NOT NULL THEN 'Externo'
        WHEN r.participantes_internos_id IS NOT NULL THEN 'Interno'
        WHEN r.participantes_friend_family_id IS NOT NULL THEN 'Friend and Family'
        ELSE 'Sin participante'
    END as tipo_participante,
    r.fecha_sesion,
    r.estado_agendamiento,
    eac.nombre as estado_nombre
FROM reclutamientos r
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
ORDER BY r.fecha_sesion DESC
LIMIT 10; 