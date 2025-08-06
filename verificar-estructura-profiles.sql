-- ====================================
-- VERIFICAR ESTRUCTURA TABLA PROFILES
-- ====================================

-- Verificar estructura de la tabla profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Ver algunos datos de ejemplo
SELECT 
    id,
    full_name,
    email,
    avatar_url,
    created_at
FROM profiles 
LIMIT 5; 