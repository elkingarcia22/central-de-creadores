-- ====================================
-- VERIFICAR ESTADO DE SEGUIMIENTOS_INVESTIGACION
-- ====================================

-- 1. Verificar si la tabla existe
SELECT 
    'Tabla existe:' as info,
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name = 'seguimientos_investigacion' 
AND table_schema = 'public';

-- 2. Si existe, mostrar su estructura
SELECT 
    'Estructura de la tabla:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'seguimientos_investigacion' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar foreign keys
SELECT 
    'Foreign keys:' as info,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'seguimientos_investigacion';

-- 4. Verificar si profiles existe
SELECT 
    'Tabla profiles existe:' as info,
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name = 'profiles' 
AND table_schema = 'public';

-- 5. Verificar algunos usuarios en profiles
SELECT 
    'Usuarios en profiles:' as info,
    id,
    full_name,
    email
FROM profiles 
LIMIT 5;

-- 6. Contar registros en seguimientos_investigacion
SELECT 
    'Registros en seguimientos_investigacion:' as info,
    COUNT(*) as total
FROM seguimientos_investigacion; 