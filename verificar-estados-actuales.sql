-- ====================================
-- VERIFICAR ESTADOS ACTUALES
-- ====================================
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar qué estados están disponibles
SELECT '=== ESTADOS DISPONIBLES EN estado_reclutamiento_cat ===' as info;
SELECT id, nombre, color FROM estado_reclutamiento_cat ORDER BY nombre;

-- 2. Verificar si existen los estados que necesitamos
SELECT '=== VERIFICAR ESTADOS NECESARIOS ===' as info;
SELECT 
    CASE WHEN EXISTS(SELECT 1 FROM estado_reclutamiento_cat WHERE nombre = 'Pendiente') THEN '✅' ELSE '❌' END as pendiente,
    CASE WHEN EXISTS(SELECT 1 FROM estado_reclutamiento_cat WHERE nombre = 'En progreso') THEN '✅' ELSE '❌' END as en_progreso,
    CASE WHEN EXISTS(SELECT 1 FROM estado_reclutamiento_cat WHERE nombre = 'Completado') THEN '✅' ELSE '❌' END as completado;

-- 3. Si no existen, crearlos
SELECT '=== CREAR ESTADOS FALTANTES ===' as info;

-- Crear estado "Pendiente" si no existe
INSERT INTO estado_reclutamiento_cat (id, nombre, color, orden)
SELECT 
    gen_random_uuid(),
    'Pendiente',
    '#F59E0B',
    1
WHERE NOT EXISTS (SELECT 1 FROM estado_reclutamiento_cat WHERE nombre = 'Pendiente');

-- Crear estado "En progreso" si no existe
INSERT INTO estado_reclutamiento_cat (id, nombre, color, orden)
SELECT 
    gen_random_uuid(),
    'En progreso',
    '#3B82F6',
    2
WHERE NOT EXISTS (SELECT 1 FROM estado_reclutamiento_cat WHERE nombre = 'En progreso');

-- Crear estado "Completado" si no existe
INSERT INTO estado_reclutamiento_cat (id, nombre, color, orden)
SELECT 
    gen_random_uuid(),
    'Completado',
    '#10B981',
    3
WHERE NOT EXISTS (SELECT 1 FROM estado_reclutamiento_cat WHERE nombre = 'Completado');

-- 4. Verificar estados después de la creación
SELECT '=== ESTADOS DESPUÉS DE LA CREACIÓN ===' as info;
SELECT id, nombre, color, orden FROM estado_reclutamiento_cat ORDER BY orden, nombre; 