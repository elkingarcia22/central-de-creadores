-- ====================================
-- INVESTIGACIÓN DE INCONSISTENCIA ENTRE VISTA Y TABLA
-- ====================================

-- 1. Verificar si el usuario existe en la tabla usuarios
SELECT 
    'usuarios' as tabla,
    id,
    nombre,
    correo,
    activo
FROM usuarios 
WHERE id = '235d3a57-6c9d-44b6-9f86-2d10e7761ce7';

-- 2. Verificar si el usuario existe en la tabla profiles
SELECT 
    'profiles' as tabla,
    id,
    full_name,
    email,
    created_at
FROM profiles 
WHERE id = '235d3a57-6c9d-44b6-9f86-2d10e7761ce7';

-- 3. Verificar si el usuario existe en la vista usuarios_con_roles
SELECT 
    'usuarios_con_roles' as vista,
    id,
    full_name,
    email,
    created_at
FROM usuarios_con_roles 
WHERE id = '235d3a57-6c9d-44b6-9f86-2d10e7761ce7';

-- 4. Verificar la estructura de la vista usuarios_con_roles
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'usuarios_con_roles' 
ORDER BY ordinal_position;

-- 5. Verificar la definición de la vista
SELECT 
    view_definition 
FROM information_schema.views 
WHERE table_name = 'usuarios_con_roles';

-- 6. Verificar todos los usuarios que están en la vista pero no en la tabla usuarios
SELECT 
    v.id,
    v.full_name,
    v.email,
    CASE 
        WHEN u.id IS NULL THEN 'NO EXISTE EN usuarios'
        ELSE 'EXISTE EN usuarios'
    END as estado_usuarios,
    CASE 
        WHEN p.id IS NULL THEN 'NO EXISTE EN profiles'
        ELSE 'EXISTE EN profiles'
    END as estado_profiles
FROM usuarios_con_roles v
LEFT JOIN usuarios u ON v.id = u.id
LEFT JOIN profiles p ON v.id = p.id
WHERE u.id IS NULL OR p.id IS NULL
ORDER BY v.full_name;

-- 7. Verificar la foreign key constraint
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'reclutamientos'
    AND kcu.column_name = 'reclutador_id';
