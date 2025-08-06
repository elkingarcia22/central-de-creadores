-- ====================================
-- CORREGIR ESTADOS DE AGENDAMIENTO PARA CARDS
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

-- 2. Verificar datos existentes
SELECT '=== DATOS EXISTENTES ===' as info;
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

-- 5. Verificar que la tabla reclutamientos tiene la columna estado_agendamiento
SELECT '=== VERIFICANDO COLUMNA EN RECLUTAMIENTOS ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'reclutamientos'
AND column_name = 'estado_agendamiento'
AND table_schema = 'public';

-- 6. Verificar algunos reclutamientos existentes con sus estados
SELECT '=== RECLUTAMIENTOS CON ESTADOS ===' as info;
SELECT 
    r.id,
    r.investigacion_id,
    r.fecha_sesion,
    r.duracion_sesion,
    r.estado_agendamiento,
    eac.nombre as estado_nombre,
    eac.activo as estado_activo
FROM reclutamientos r
LEFT JOIN estado_agendamiento_cat eac ON r.estado_agendamiento = eac.id
LIMIT 10; 