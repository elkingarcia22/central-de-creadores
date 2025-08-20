-- VERIFICAR USUARIO ESPECÍFICO Y SUS ROLES
-- Usuario que está causando problemas: 88d81660-8881-4041-be1c-3336ab95fefb

-- 1. Verificar si existe en la tabla profiles (Supabase Auth)
SELECT 
    'profiles' as tabla,
    id,
    full_name,
    email,
    avatar_url,
    'Sin roles específicos' as roles
FROM profiles 
WHERE id = '88d81660-8881-4041-be1c-3336ab95fefb';

-- 2. Verificar si existe en la vista usuarios_con_roles
SELECT 
    'usuarios_con_roles' as tabla,
    id,
    full_name,
    email,
    avatar_url,
    roles
FROM usuarios_con_roles 
WHERE id = '88d81660-8881-4041-be1c-3336ab95fefb';

-- 3. Verificar si existe en la tabla usuarios
SELECT 
    'usuarios' as tabla,
    id,
    nombre as full_name,
    correo as email,
    'Sin avatar' as avatar_url,
    'Sin roles específicos' as roles
FROM usuarios 
WHERE id = '88d81660-8881-4041-be1c-3336ab95fefb';

-- 4. Verificar si tiene roles asignados
SELECT 
    'user_roles' as tabla,
    user_id,
    role_id,
    'Verificar rol' as rol_info
FROM user_roles 
WHERE user_id = '88d81660-8881-4041-be1c-3336ab95fefb';

-- 5. Verificar roles disponibles
SELECT 
    'roles' as tabla,
    id,
    name,
    description
FROM roles 
ORDER BY name;

-- 6. Verificar todos los usuarios con roles de reclutador o administrador
SELECT 
    'usuarios_con_roles_reclutador_admin' as tabla,
    id,
    full_name,
    email,
    roles
FROM usuarios_con_roles 
WHERE roles::text ILIKE '%reclutador%' 
   OR roles::text ILIKE '%administrador%'
   OR roles::text ILIKE '%admin%'
ORDER BY full_name;

-- 7. Verificar el reclutamiento específico
SELECT 
    'reclutamientos' as tabla,
    id,
    reclutador_id,
    investigacion_id,
    fecha_asignado
FROM reclutamientos 
WHERE id = 'c7278663-0b01-42f2-a940-0ea194502e96';
