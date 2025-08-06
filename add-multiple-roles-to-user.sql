-- Script para agregar múltiples roles al usuario actual
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar el usuario actual autenticado
SELECT 
    'Usuario actual autenticado:' as info,
    auth.uid() as user_id,
    p.email,
    p.full_name
FROM profiles p 
WHERE p.id = auth.uid();

-- 2. Verificar roles existentes del usuario
SELECT 
    'Roles actuales del usuario:' as info,
    ur.role,
    rp.nombre as rol_nombre
FROM user_roles ur
LEFT JOIN roles_plataforma rp ON ur.role = rp.nombre
WHERE ur.user_id = auth.uid();

-- 3. Agregar rol 'investigador' si no existe
INSERT INTO user_roles (user_id, role, created_at, updated_at)
SELECT 
    auth.uid(),
    'investigador',
    NOW(),
    NOW()
WHERE auth.uid() IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'investigador'
);

-- 4. Agregar rol 'administrador' si no existe
INSERT INTO user_roles (user_id, role, created_at, updated_at)
SELECT 
    auth.uid(),
    'administrador',
    NOW(),
    NOW()
WHERE auth.uid() IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'administrador'
);

-- 5. Verificar los roles finales del usuario
SELECT 
    'Roles finales del usuario:' as info,
    ur.role,
    rp.nombre as rol_nombre,
    ur.created_at
FROM user_roles ur
LEFT JOIN roles_plataforma rp ON ur.role = rp.nombre
WHERE ur.user_id = auth.uid()
ORDER BY ur.created_at;

-- 6. Verificar que los roles existen en roles_plataforma
SELECT 
    'Roles disponibles en la plataforma:' as info,
    nombre,
    descripcion
FROM roles_plataforma
ORDER BY nombre;
