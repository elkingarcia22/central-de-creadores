-- ====================================
-- OBTENER ESTRUCTURA DE TABLAS DE USUARIOS
-- ====================================

-- 1. Estructura de la tabla profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. Estructura de la tabla user_roles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_roles' 
ORDER BY ordinal_position;

-- 3. Estructura de la tabla roles_plataforma
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'roles_plataforma' 
ORDER BY ordinal_position;

-- 4. Estructura de la vista usuarios_con_roles
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'usuarios_con_roles' 
ORDER BY ordinal_position;

-- 5. Datos de ejemplo de roles_plataforma
SELECT * FROM roles_plataforma ORDER BY nombre;

-- 6. Datos de ejemplo de user_roles
SELECT 
    ur.user_id,
    ur.role,
    rp.nombre as rol_nombre
FROM user_roles ur
LEFT JOIN roles_plataforma rp ON ur.role = rp.id
LIMIT 10;

-- 7. Datos de ejemplo de usuarios_con_roles
SELECT * FROM usuarios_con_roles LIMIT 5;

-- 1. Estructura de la tabla profiles
SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'profiles' ORDER BY ordinal_position;

-- 2. Estructura de la tabla user_roles
SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'user_roles' ORDER BY ordinal_position;

-- 3. Estructura de la tabla roles_plataforma
SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'roles_plataforma' ORDER BY ordinal_position;

-- 4. Datos de ejemplo de roles_plataforma
SELECT * FROM roles_plataforma ORDER BY nombre;

-- 5. Datos de ejemplo de usuarios_con_roles
SELECT * FROM usuarios_con_roles LIMIT 5;
SELECT * FROM usuarios_con_roles WHERE id = '9b1ef1eb-fdb4-410f-ab22-bfedc68294d6';
