-- Verificar si existe la tabla usuarios original
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar qué tablas existen relacionadas con usuarios
SELECT 
    'Tablas disponibles:' as info,
    table_name
FROM information_schema.tables 
WHERE table_name LIKE '%usuario%' OR table_name LIKE '%profile%'
ORDER BY table_name;

-- 2. Si existe la tabla usuarios, verificar su estructura
SELECT 
    'Estructura de usuarios:' as info,
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
ORDER BY ordinal_position;

-- 3. Si existe la tabla usuarios, ver algunos datos de ejemplo
SELECT 
    'Datos en usuarios:' as info,
    id,
    nombre,
    email,
    avatar,
    roles,
    created_at
FROM usuarios 
LIMIT 3;

-- 4. Verificar estructura de profiles también
SELECT 
    'Estructura de profiles:' as info,
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position; 