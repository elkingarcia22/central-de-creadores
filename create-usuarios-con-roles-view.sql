-- Crear vista usuarios_con_roles para simplificar consultas
-- Ejecutar en el SQL Editor de Supabase

-- Verificar estructura de la tabla profiles
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar qué columnas existen en profiles
SELECT 
    'Columnas en profiles:' as info,
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. Verificar qué columnas existen en user_roles
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_roles' 
ORDER BY ordinal_position;

-- 1. Eliminar la vista si existe
DROP VIEW IF EXISTS usuarios_con_roles;

-- 2. Crear la vista con roles como texto
CREATE VIEW usuarios_con_roles AS
SELECT 
    p.id,
    p.full_name,
    p.email,
    p.avatar_url,
    p.created_at,
    p.updated_at,
    -- Convertir UUIDs de roles a texto y agrupar
    CASE 
        WHEN COUNT(ur.role) > 0 THEN ARRAY_AGG(ur.role::text)
        ELSE '{}'::text[]
    END as roles
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
GROUP BY p.id, p.full_name, p.email, p.avatar_url, p.created_at, p.updated_at;

-- 3. Verificar que la vista se creó correctamente
SELECT 
    'Vista creada con roles como UUIDs convertidos a texto' as status;

-- 4. Probar la vista
SELECT 
    id,
    full_name,
    email,
    avatar_url,
    roles,
    created_at
FROM usuarios_con_roles 
LIMIT 3;

-- NOTA: Los índices no se pueden crear en vistas, solo en las tablas base (profiles, user_roles)
-- Los índices de las tablas base ya están creados y serán utilizados automáticamente por la vista

-- 7. Ahora verificar si existe alguna columna de avatar
SELECT 
    'Buscando columnas de avatar:' as info,
    column_name
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name LIKE '%avatar%';

-- 8. Si existe una columna de avatar, ejecutar esto para agregar el avatar a la vista:
-- DROP VIEW usuarios_con_roles;
-- 
-- CREATE VIEW usuarios_con_roles AS
-- SELECT 
--     p.id,
--     p.full_name,
--     p.email,
--     p.avatar as avatar_url,  -- Cambiar por el nombre correcto de la columna
--     p.created_at,
--     p.updated_at,
--     COALESCE(
--         ARRAY_AGG(ur.role) FILTER (WHERE ur.role IS NOT NULL),
--         ARRAY[]::text[]
--     ) as roles
-- FROM profiles p
-- LEFT JOIN user_roles ur ON p.id = ur.user_id
-- GROUP BY p.id, p.full_name, p.email, p.avatar, p.created_at, p.updated_at;

-- Crear índice para mejorar el rendimiento de la vista
CREATE INDEX IF NOT EXISTS idx_usuarios_con_roles_email ON usuarios_con_roles(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_con_roles_full_name ON usuarios_con_roles(full_name);
CREATE INDEX IF NOT EXISTS idx_usuarios_con_roles_created_at ON usuarios_con_roles(created_at);

-- Política de seguridad para la vista (heredar de profiles)
CREATE POLICY "usuarios_con_roles_select_policy" ON usuarios_con_roles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Verificar que la vista se creó correctamente
SELECT 
    'Vista creada:' as info,
    schemaname,
    viewname
FROM pg_views 
WHERE viewname = 'usuarios_con_roles';

-- Probar la vista
SELECT 
    'Datos de prueba:' as info,
    id,
    full_name,
    email,
    roles,
    created_at
FROM usuarios_con_roles 
LIMIT 5; 