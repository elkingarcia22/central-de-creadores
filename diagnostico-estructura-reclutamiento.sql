-- ====================================
-- DIAGNÓSTICO DE ESTRUCTURA PARA RECLUTAMIENTO
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar todas las tablas que contengan "libreto" en el nombre
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name ILIKE '%libreto%'
ORDER BY table_name;

-- 2. Verificar todas las tablas que contengan "reclutamiento" en el nombre
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name ILIKE '%reclutamiento%'
ORDER BY table_name;

-- 3. Verificar todas las tablas que contengan "estado" en el nombre
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name ILIKE '%estado%'
ORDER BY table_name;

-- 4. Verificar la estructura de la tabla investigaciones
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'investigaciones' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Verificar si existe alguna tabla de catálogos
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name ILIKE '%cat%'
ORDER BY table_name;

-- 6. Verificar la estructura de la tabla usuarios
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Verificar si existe la tabla reclutamientos
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'reclutamientos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. Ver algunos datos de ejemplo de investigaciones
SELECT id, nombre, estado, libreto, responsable_id, implementador_id, riesgo_automatico
FROM investigaciones 
LIMIT 5; 