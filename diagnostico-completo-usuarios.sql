-- ====================================
-- DIAGNÓSTICO COMPLETO DE ESTRUCTURA DE USUARIOS
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar qué tablas de usuarios existen
SELECT 
    'Tablas relacionadas con usuarios:' as info,
    table_name,
    table_type,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%usuario%' OR table_name LIKE '%profile%')
ORDER BY table_name;

-- 2. Verificar estructura de la tabla usuarios
SELECT 
    'Estructura de tabla usuarios:' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar estructura de la tabla profiles
SELECT 
    'Estructura de tabla profiles:' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar estructura de la vista usuarios_con_roles
SELECT 
    'Estructura de vista usuarios_con_roles:' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'usuarios_con_roles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Ver algunos datos de ejemplo en usuarios
SELECT 
    'Datos de ejemplo en usuarios:' as info,
    *
FROM usuarios 
LIMIT 3;

-- 6. Ver algunos datos de ejemplo en profiles
SELECT 
    'Datos de ejemplo en profiles:' as info,
    *
FROM profiles 
LIMIT 3;

-- 7. Ver algunos datos de ejemplo en usuarios_con_roles
SELECT 
    'Datos de ejemplo en usuarios_con_roles:' as info,
    *
FROM usuarios_con_roles 
LIMIT 3;

-- 8. Verificar la definición de la vista usuarios_con_roles
SELECT 
    'Definición de la vista usuarios_con_roles:' as info,
    view_definition
FROM information_schema.views 
WHERE table_name = 'usuarios_con_roles' 
AND table_schema = 'public'; 