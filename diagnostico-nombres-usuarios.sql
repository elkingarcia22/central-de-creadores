-- ====================================
-- DIAGNÓSTICO DE NOMBRES DE USUARIOS
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar estructura de la tabla profiles
SELECT 
    '=== ESTRUCTURA PROFILES ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. Verificar datos de profiles
SELECT 
    '=== DATOS DE PROFILES ===' as info;

SELECT 
    id,
    full_name,
    email,
    created_at
FROM profiles 
ORDER BY created_at DESC
LIMIT 10;

-- 3. Verificar investigaciones con responsables
SELECT 
    '=== INVESTIGACIONES CON RESPONSABLES ===' as info;

SELECT 
    i.id,
    i.nombre,
    i.responsable_id,
    i.implementador_id,
    resp.full_name as responsable_full_name,
    resp.email as responsable_email,
    impl.full_name as implementador_full_name,
    impl.email as implementador_email
FROM investigaciones i
LEFT JOIN profiles resp ON i.responsable_id = resp.id
LEFT JOIN profiles impl ON i.implementador_id = impl.id
WHERE i.estado = 'por_agendar'
ORDER BY i.creado_el DESC;

-- 4. Verificar si hay usuarios sin full_name
SELECT 
    '=== USUARIOS SIN FULL_NAME ===' as info;

SELECT 
    id,
    full_name,
    email,
    created_at
FROM profiles 
WHERE full_name IS NULL OR full_name = ''
ORDER BY created_at DESC;

-- 5. Verificar estados de investigaciones
SELECT 
    '=== ESTADOS DE INVESTIGACIONES ===' as info;

SELECT 
    estado,
    COUNT(*) as cantidad
FROM investigaciones 
GROUP BY estado
ORDER BY cantidad DESC;

-- 6. Verificar investigaciones por agendar específicamente
SELECT 
    '=== INVESTIGACIONES POR AGENDAR ===' as info;

SELECT 
    id,
    nombre,
    estado,
    responsable_id,
    implementador_id,
    creado_el
FROM investigaciones 
WHERE estado = 'por_agendar'
ORDER BY creado_el DESC; 