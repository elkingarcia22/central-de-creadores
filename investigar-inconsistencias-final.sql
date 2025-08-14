-- ====================================
-- INVESTIGACIÓN COMPLETA DE INCONSISTENCIAS ENTRE TABLAS DE USUARIOS
-- ====================================

-- 1. Verificar todos los usuarios en la tabla usuarios
SELECT 
    'usuarios' as fuente,
    id,
    nombre,
    correo,
    activo,
    COUNT(*) as total
FROM usuarios 
GROUP BY id, nombre, correo, activo
ORDER BY nombre;

-- 2. Verificar todos los usuarios en la tabla profiles
SELECT 
    'profiles' as fuente,
    id,
    full_name,
    email,
    COUNT(*) as total
FROM profiles 
GROUP BY id, full_name, email
ORDER BY full_name;

-- 3. Verificar todos los usuarios en la vista usuarios_con_roles
SELECT 
    'usuarios_con_roles' as fuente,
    id,
    full_name,
    email,
    COUNT(*) as total
FROM usuarios_con_roles 
GROUP BY id, full_name, email
ORDER BY full_name;

-- 4. Encontrar usuarios que están en usuarios_con_roles pero NO en usuarios
SELECT 
    'FALTANTE EN usuarios' as problema,
    v.id,
    v.full_name,
    v.email,
    CASE 
        WHEN u.id IS NULL THEN 'NO EXISTE'
        ELSE 'EXISTE'
    END as en_usuarios,
    CASE 
        WHEN p.id IS NULL THEN 'NO EXISTE'
        ELSE 'EXISTE'
    END as en_profiles
FROM usuarios_con_roles v
LEFT JOIN usuarios u ON v.id = u.id
LEFT JOIN profiles p ON v.id = p.id
WHERE u.id IS NULL
ORDER BY v.full_name;

-- 5. Encontrar usuarios que están en usuarios pero NO en profiles
SELECT 
    'FALTANTE EN profiles' as problema,
    u.id,
    u.nombre,
    u.correo,
    CASE 
        WHEN p.id IS NULL THEN 'NO EXISTE'
        ELSE 'EXISTE'
    END as en_profiles,
    CASE 
        WHEN v.id IS NULL THEN 'NO EXISTE'
        ELSE 'EXISTE'
    END as en_vista
FROM usuarios u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN usuarios_con_roles v ON u.id = v.id
WHERE p.id IS NULL
ORDER BY u.nombre;

-- 6. Encontrar usuarios que están en profiles pero NO en usuarios
SELECT 
    'FALTANTE EN usuarios' as problema,
    p.id,
    p.full_name,
    p.email,
    CASE 
        WHEN u.id IS NULL THEN 'NO EXISTE'
        ELSE 'EXISTE'
    END as en_usuarios,
    CASE 
        WHEN v.id IS NULL THEN 'NO EXISTE'
        ELSE 'EXISTE'
    END as en_vista
FROM profiles p
LEFT JOIN usuarios u ON p.id = u.id
LEFT JOIN usuarios_con_roles v ON p.id = v.id
WHERE u.id IS NULL
ORDER BY p.full_name;

-- 7. Contar totales por tabla
SELECT 
    'usuarios' as tabla,
    COUNT(*) as total
FROM usuarios
UNION ALL
SELECT 
    'profiles' as tabla,
    COUNT(*) as total
FROM profiles
UNION ALL
SELECT 
    'usuarios_con_roles' as tabla,
    COUNT(*) as total
FROM usuarios_con_roles;

-- 8. Verificar la definición actual de la vista usuarios_con_roles
SELECT 
    view_definition 
FROM information_schema.views 
WHERE table_name = 'usuarios_con_roles';
