-- ====================================
-- INVESTIGAR ESTRUCTURA Y DATOS DE ESTADO_AGENDAMIENTO_CAT
-- ====================================
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si la tabla existe
SELECT 
    'Tabla existe' as tipo,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'estado_agendamiento_cat'
AND table_schema = 'public';

-- 2. Verificar estructura completa de la tabla
SELECT 
    'Estructura completa' as tipo,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'estado_agendamiento_cat'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar todos los datos existentes
SELECT 
    'Datos existentes' as tipo,
    id,
    nombre,
    activo
FROM estado_agendamiento_cat
ORDER BY nombre;

-- 4. Verificar cuántos registros hay
SELECT 
    'Conteo total' as tipo,
    COUNT(*) as total_registros
FROM estado_agendamiento_cat;

-- 5. Verificar si hay columnas adicionales (color, orden, etc.)
SELECT 
    'Columnas adicionales' as tipo,
    column_name
FROM information_schema.columns 
WHERE table_name = 'estado_agendamiento_cat'
AND table_schema = 'public'
AND column_name NOT IN ('id', 'nombre', 'activo')
ORDER BY ordinal_position; 