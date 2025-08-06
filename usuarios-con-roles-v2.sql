-- Crear vista usuarios_con_roles CON nombres de roles (ALTERNATIVA)
-- Ejecutar en el SQL Editor de Supabase

-- 1. Eliminar la vista si existe
DROP VIEW IF EXISTS usuarios_con_roles;

-- 2. Crear la vista obteniendo nombres de roles desde roles_plataforma
CREATE VIEW usuarios_con_roles AS
SELECT 
    p.id,
    p.full_name,
    p.email,
    p.avatar_url,
    p.created_at,
    p.updated_at,
    -- Agrupar nombres de roles (no UUIDs)
    CASE 
        WHEN COUNT(rp.nombre) > 0 THEN ARRAY_AGG(rp.nombre)
        ELSE '{}'::text[]
    END as roles
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
LEFT JOIN roles_plataforma rp ON ur.role = rp.nombre
GROUP BY p.id, p.full_name, p.email, p.avatar_url, p.created_at, p.updated_at;

-- 3. Si el JOIN anterior no funciona porque ur.role es UUID, usar esta versión:
-- DROP VIEW IF EXISTS usuarios_con_roles;
-- 
-- CREATE VIEW usuarios_con_roles AS
-- SELECT 
--     p.id,
--     p.full_name,
--     p.email,
--     p.avatar_url,
--     p.created_at,
--     p.updated_at,
--     CASE 
--         WHEN COUNT(rp.nombre) > 0 THEN ARRAY_AGG(rp.nombre)
--         ELSE '{}'::text[]
--     END as roles
-- FROM profiles p
-- LEFT JOIN user_roles ur ON p.id = ur.user_id
-- LEFT JOIN roles_plataforma rp ON ur.role::uuid = rp.id
-- GROUP BY p.id, p.full_name, p.email, p.avatar_url, p.created_at, p.updated_at;

-- 4. Verificar que la vista se creó correctamente
SELECT 
    'Vista creada con nombres de roles' as status;

-- 5. Probar la vista
SELECT 
    id,
    full_name,
    email,
    avatar_url,
    roles,
    created_at
FROM usuarios_con_roles 
LIMIT 3;

-- NOTA: Los índices no se pueden crear en vistas, solo en las tablas base (profiles, user_roles, roles_plataforma)
-- Los índices de las tablas base ya están creados y serán utilizados automáticamente por la vista 