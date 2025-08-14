-- ====================================
-- CORREGIR VISTA usuarios_con_roles PARA DEVOLVER UUIDs
-- ====================================

-- 1. Eliminar la vista actual
DROP VIEW IF EXISTS usuarios_con_roles;

-- 2. Crear la vista CORREGIDA que devuelve UUIDs de roles
CREATE VIEW usuarios_con_roles AS
SELECT 
    p.id,
    p.full_name,
    p.email,
    p.avatar_url,
    p.created_at,
    p.updated_at,
    -- Agrupar UUIDs de roles (no nombres)
    CASE 
        WHEN COUNT(ur.role) > 0 THEN ARRAY_AGG(ur.role::text)
        ELSE '{}'::text[]
    END as roles
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
GROUP BY p.id, p.full_name, p.email, p.avatar_url, p.created_at, p.updated_at;

-- 3. Verificar que la vista se creó correctamente
SELECT 
    'Vista usuarios_con_roles corregida - devuelve UUIDs de roles' as status;

-- 4. Probar la vista con el usuario específico
SELECT 
    id,
    full_name,
    email,
    roles,
    created_at
FROM usuarios_con_roles 
WHERE id = '9b1ef1eb-fdb4-410f-ab22-bfedc68294d6';

-- 5. Verificar que los roles son UUIDs
SELECT 
    'Verificando formato de roles:' as info,
    id,
    full_name,
    roles,
    CASE 
        WHEN roles = '{}' THEN 'Sin roles'
        WHEN roles[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 'UUIDs válidos'
        ELSE 'Formato incorrecto'
    END as formato_roles
FROM usuarios_con_roles 
LIMIT 5;

-- 6. Comparar con la tabla roles_plataforma para verificar
SELECT 
    'Roles disponibles en roles_plataforma:' as info,
    id,
    nombre
FROM roles_plataforma 
ORDER BY nombre;
